"use client";
import { useLanguage } from "@/components/language-provider";
export function HeroCopy() { const { t } = useLanguage(); return <section className="hero"><p className="eyebrow">NEERPLAN · PRODUCTION BUILD</p><h1>{t("heroTitle")}</h1><p>{t("heroText")}</p><div className="foundation-status"><span>NEERPLAN</span><strong>Plan with confidence.</strong><small>Start a free, transparent rooftop assessment below.</small></div></section>; }
