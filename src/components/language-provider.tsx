"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations, type Language } from "@/lib/i18n";
import { SessionProvider } from "next-auth/react";
const Context = createContext<{ language: Language; setLanguage: (language: Language) => void; t: (key: string) => string } | null>(null);
export function LanguageProvider({ children }: { children: React.ReactNode }) { const [language, setLanguageState] = useState<Language>("en"); useEffect(() => { const saved = window.localStorage.getItem("neerplan-language") as Language | null; if (saved && translations[saved]) { setLanguageState(saved); document.documentElement.lang = saved; } }, []); function setLanguage(next: Language) { setLanguageState(next); window.localStorage.setItem("neerplan-language", next); document.documentElement.lang = next; } const value = useMemo(() => ({ language, setLanguage, t: (key: string) => translations[language][key] ?? translations.en[key] ?? key }), [language]); return <SessionProvider><Context.Provider value={value}>{children}</Context.Provider></SessionProvider>; }
export function useLanguage() { const value = useContext(Context); if (!value) throw new Error("useLanguage must be used inside LanguageProvider"); return value; }
