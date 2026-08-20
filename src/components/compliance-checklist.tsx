"use client";

import { useState } from "react";
import { getComplianceProfile } from "@/lib/compliance";
import { useLanguage } from "@/components/language-provider";

type Props = { state?: string; city?: string; buildingType?: string; initialStatus?: string; onStatusChange?: (status: string) => void };

export function ComplianceChecklist({ state = "Tamil Nadu", city, buildingType = "independent_house", initialStatus = "PENDING_MUNICIPAL_CONFIRMATION", onStatusChange }: Props) {
  const profile = getComplianceProfile(state, buildingType); const { t } = useLanguage();
  const [status, setStatus] = useState(initialStatus);
  const [checked, setChecked] = useState<boolean[]>(() => profile.checklist.map(() => false));
  function updateStatus(next: string) { setStatus(next); onStatusChange?.(next); }
  return <section className="compliance-checklist" aria-labelledby="compliance-heading"><p className="eyebrow">{t("complianceTitle")}</p><h2 id="compliance-heading">{profile.jurisdiction}</h2><p className="guidance-note"><strong>{t("guidance")}</strong> {profile.summary} {city && <>Assessment city: <span data-no-translate>{city}</span>.</>}</p><div className="compliance-status"><span>{t("status")}</span><strong>{status === "USER_REVIEWED" ? t("reviewed") : t("pending")}</strong><button type="button" onClick={() => updateStatus(status === "USER_REVIEWED" ? "PENDING_MUNICIPAL_CONFIRMATION" : "USER_REVIEWED")}>{status === "USER_REVIEWED" ? t("keepPending") : t("markReviewed")}</button></div><h3>{t("required")}</h3><ul>{profile.requiredStructure.map((item) => <li key={item}>{item}</li>)}</ul><h3>{t("checklist")}</h3><ul className="compliance-items">{profile.checklist.map((item, index) => <li key={item.title}><label><input type="checkbox" checked={checked[index]} onChange={() => setChecked((current) => current.map((value, itemIndex) => itemIndex === index ? !value : value))} /><span><strong>{item.title}</strong><small>{item.detail}</small></span></label></li>)}</ul><h3>{t("documents")}</h3><ul>{profile.documents.map((item) => <li key={item}>{item}</li>)}</ul><h3>{t("officialLinks")}</h3><ul>{profile.officialLinks.map((link) => <li key={link.href}><a href={link.href} target="_blank" rel="noreferrer">{link.label}</a></li>)}</ul><p className="guidance-note">{t("confirm")}</p></section>;
}
