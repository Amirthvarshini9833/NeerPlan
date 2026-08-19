"use client";
import { languages } from "@/lib/i18n";
import { useLanguage } from "@/components/language-provider";
export function LanguageSelector() { const { language, setLanguage, t } = useLanguage(); return <label className="language-selector"><span className="sr-only">{t("language")}</span><select aria-label={t("language")} value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>{languages.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>; }
