"use client";

import { useEffect } from "react";
import { useLanguage } from "@/components/language-provider";
import type { Language } from "@/lib/i18n";

const translatableAttributes = ["aria-label", "placeholder", "title"] as const;
type TranslatableAttribute = (typeof translatableAttributes)[number];

type TextTarget = {
  node: Text;
  attribute?: never;
  source: string;
  leadingWhitespace: string;
  trailingWhitespace: string;
};

type AttributeTarget = {
  node: Element;
  attribute: TranslatableAttribute;
  source: string;
  leadingWhitespace: string;
  trailingWhitespace: string;
};

type TranslationTarget = TextTarget | AttributeTarget;

class TranslationRequestError extends Error {
  constructor(readonly status: number, message: string) {
    super(message);
  }
}

const originalTexts = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<TranslatableAttribute, string>>();
const excludedSelector = "script, style, noscript, textarea, [contenteditable='true'], [data-no-translate]";
const cachePrefix = "neerplan-gemini-translations-v5";
const maxStringsPerRequest = 50;
const maxCharactersPerRequest = 7_500;

function splitWhitespace(value: string) {
  const leadingWhitespace = value.match(/^\s*/)?.[0] ?? "";
  const trailingWhitespace = value.match(/\s*$/)?.[0] ?? "";
  return {
    leadingWhitespace,
    trailingWhitespace,
    source: value.slice(leadingWhitespace.length, value.length - trailingWhitespace.length),
  };
}

function canTranslate(element: Element | null, source: string) {
  const trimmed = source.trim();
  return Boolean(element)
    && !element!.closest(excludedSelector)
    && trimmed.length > 0
    && trimmed.length <= 1_000
    && /\p{L}/u.test(trimmed)
    && !/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/.test(trimmed)
    && !/https?:\/\//i.test(trimmed);
}

function getOriginalAttribute(element: Element, attribute: TranslatableAttribute) {
  let attributes = originalAttributes.get(element);
  if (!attributes) {
    attributes = new Map();
    originalAttributes.set(element, attributes);
  }
  if (!attributes.has(attribute)) attributes.set(attribute, element.getAttribute(attribute) ?? "");
  return attributes.get(attribute) ?? "";
}

function collectTextTargets(root: Node): TextTarget[] {
  const textNodes: Text[] = [];
  if (root.nodeType === Node.TEXT_NODE) textNodes.push(root as Text);
  else {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node: Node | null;
    while ((node = walker.nextNode())) textNodes.push(node as Text);
  }

  return textNodes.flatMap((node) => {
    if (!originalTexts.has(node)) originalTexts.set(node, node.nodeValue ?? "");
    const sourceWithWhitespace = originalTexts.get(node) ?? "";
    if (!canTranslate(node.parentElement, sourceWithWhitespace)) return [];
    const { source, leadingWhitespace, trailingWhitespace } = splitWhitespace(sourceWithWhitespace);
    return source ? [{ node, source, leadingWhitespace, trailingWhitespace }] : [];
  });
}

function collectAttributeTargets(root: Node): AttributeTarget[] {
  if (root.nodeType === Node.TEXT_NODE) return [];
  const rootElement = root.nodeType === Node.ELEMENT_NODE ? root as Element : null;
  const elements = [
    ...(rootElement ? [rootElement] : []),
    ...Array.from((rootElement ?? document.body).querySelectorAll(translatableAttributes.map((attribute) => `[${attribute}]`).join(","))),
  ];

  return elements.flatMap((element) => translatableAttributes.flatMap((attribute) => {
    if (!element.hasAttribute(attribute)) return [];
    const sourceWithWhitespace = getOriginalAttribute(element, attribute);
    if (!canTranslate(element, sourceWithWhitespace)) return [];
    const { source, leadingWhitespace, trailingWhitespace } = splitWhitespace(sourceWithWhitespace);
    return source ? [{ node: element, attribute, source, leadingWhitespace, trailingWhitespace }] : [];
  }));
}

function collectTargets(root: Node): TranslationTarget[] {
  return [...collectTextTargets(root), ...collectAttributeTargets(root)];
}

function readCache(language: Language) {
  try {
    const stored = window.sessionStorage.getItem(`${cachePrefix}:${language}`);
    const parsed: unknown = stored ? JSON.parse(stored) : {};
    return new Map(Object.entries(parsed && typeof parsed === "object" ? parsed : {}).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
  } catch {
    return new Map<string, string>();
  }
}

function writeCache(language: Language, cache: Map<string, string>) {
  try {
    window.sessionStorage.setItem(`${cachePrefix}:${language}`, JSON.stringify(Object.fromEntries(cache)));
  } catch {
    // Translation still works when browser storage is disabled.
  }
}

function batchStrings(strings: string[]) {
  const batches: string[][] = [];
  let batch: string[] = [];
  let characterCount = 0;

  for (const value of strings) {
    if (batch.length === maxStringsPerRequest || characterCount + value.length > maxCharactersPerRequest) {
      batches.push(batch);
      batch = [];
      characterCount = 0;
    }
    batch.push(value);
    characterCount += value.length;
  }
  if (batch.length) batches.push(batch);
  return batches;
}

async function requestTranslations(language: Language, strings: string[], signal: AbortSignal) {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ targetLanguage: language, strings }),
    signal,
  });
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok || !data || typeof data !== "object" || !("translations" in data) || !Array.isArray(data.translations)) {
    const message = data && typeof data === "object" && "error" in data && typeof data.error === "string" ? data.error : "Translation request failed.";
    throw new TranslationRequestError(response.status, message);
  }

  const translations = data.translations;
  if (translations.length !== strings.length || translations.some((translation) => typeof translation !== "string")) {
    throw new TranslationRequestError(response.status, "Translation response was incomplete.");
  }

  return translations as string[];
}

export function LanguageDomTranslator() {
  const { language } = useLanguage();

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;
    let queued = false;
    let running = false;
    let rerunRequested = false;
    const cache = readCache(language);
    const writtenTextNodes = new WeakSet<Text>();
    const writtenAttributes = new WeakMap<Element, Set<TranslatableAttribute>>();

    const markAttributeWrite = (element: Element, attribute: TranslatableAttribute) => {
      const attributes = writtenAttributes.get(element) ?? new Set<TranslatableAttribute>();
      attributes.add(attribute);
      writtenAttributes.set(element, attributes);
    };

    const apply = (targets: TranslationTarget[]) => {
      for (const target of targets) {
        const translated = language === "en" ? target.source : cache.get(target.source);
        if (!translated || !target.node.isConnected) continue;
        const nextValue = `${target.leadingWhitespace}${translated}${target.trailingWhitespace}`;
        if (target.attribute) {
          if (target.node.getAttribute(target.attribute) !== nextValue) {
            markAttributeWrite(target.node, target.attribute);
            target.node.setAttribute(target.attribute, nextValue);
          }
        } else if (target.node.nodeValue !== nextValue) {
          writtenTextNodes.add(target.node);
          target.node.nodeValue = nextValue;
        }
      }
    };

    const translatePage = async () => {
      if (running) {
        rerunRequested = true;
        return;
      }
      running = true;
      try {
        do {
          rerunRequested = false;
          const targets = collectTargets(document.body);

          if (language === "en") {
            apply(targets);
            continue;
          }

          apply(targets);
          const missing = [...new Set(targets.map(({ source }) => source).filter((source) => !cache.has(source)))];

          for (const batch of batchStrings(missing)) {
            const translations = await requestTranslations(language, batch, controller.signal);
            if (cancelled) return;
            batch.forEach((source, index) => cache.set(source, translations[index]));
            writeCache(language, cache);
          }
          if (!cancelled) apply(targets);
        } while (rerunRequested && !cancelled);
      } catch (error) {
        if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) {
          const message = error instanceof TranslationRequestError && error.status === 503
            ? "NeerPlan translation is not configured. Add GEMINI_API_KEY to the server environment."
            : "NeerPlan translation was unavailable; displaying the built-in copy instead.";
          console.warn(message);
        }
      } finally {
        running = false;
      }
    };

    const queueTranslation = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => {
        queued = false;
        if (!cancelled) void translatePage();
      });
    };

    queueTranslation();

    const observer = new MutationObserver((records) => {
      const hasExternalChange = records.some((record) => {
        if (record.type === "characterData") {
          const node = record.target as Text;
          if (!writtenTextNodes.has(node)) return true;
          writtenTextNodes.delete(node);
          return false;
        }

        if (record.type === "attributes") {
          const attribute = record.attributeName as TranslatableAttribute | null;
          const node = record.target as Element;
          const attributes = writtenAttributes.get(node);
          if (!attribute || !attributes?.has(attribute)) return true;
          attributes.delete(attribute);
          if (!attributes.size) writtenAttributes.delete(node);
          return false;
        }

        return true;
      });
      if (hasExternalChange) queueTranslation();
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [...translatableAttributes],
      characterData: true,
      childList: true,
      subtree: true,
    });

    return () => {
      cancelled = true;
      controller.abort();
      observer.disconnect();
    };
  }, [language]);

  return null;
}
