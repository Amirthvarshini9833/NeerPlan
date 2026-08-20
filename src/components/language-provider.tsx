"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, type Language } from "@/lib/i18n";
import { SessionProvider } from "next-auth/react";
import { LanguageDomTranslator } from "@/components/language-dom-translator";

const Context = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string } | null>(null);

function getSavedLanguage(): Language {
  const saved = window.localStorage.getItem("neerplan-language") as Language | null;
  return saved && translations[saved] ? saved : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Render English during hydration, then restore the persisted preference to avoid an SSR/client mismatch.
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    setLanguageState(getSavedLanguage());
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(next: Language) {
    window.localStorage.setItem("neerplan-language", next);
    setLanguageState(next);
  }

  const value = useMemo(() => ({
    language,
    setLanguage,
    t: (key: string) => translations[language][key] ?? translations.en[key] ?? key,
  }), [language]);

  return <SessionProvider><Context.Provider value={value}><LanguageDomTranslator />{children}</Context.Provider></SessionProvider>;
}

export function useLanguage() {
  const value = useContext(Context);
  if (!value) throw new Error("useLanguage must be used inside LanguageProvider");
  return value;
}
