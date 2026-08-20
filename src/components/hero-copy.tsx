"use client";
import { useLanguage } from "@/components/language-provider";
export function HeroCopy() { const { t } = useLanguage(); return <section className="hero"><p className="eyebrow"><span data-no-translate>NEERPLAN</span> · PRODUCTION BUILD</p><h1 data-no-translate>{t("heroTitle")}</h1><p data-no-translate>{t("heroText")}</p><p className="hero-callout">Plan with confidence. Start a free, transparent rooftop assessment below.</p></section>; }
