"use client";

import { useState } from "react";
import { QuoteEntryForm } from "@/components/quote-entry-form";

type Lead = { id: string; name: string; phone: string; status: string; createdAt: string; quoteCountRequested: number; recommendationSystem: string; quotes: { id: string }[]; assessment: { city: string; state: string; roofAreaSqFt: number; areaSource: string; areaLocation: string | null; roofType: string; annualRainfallMm: number; rainfallSource: string; occupants: number; buildingType: string; availableSpace: string; suggestedTankLitres: number; recommendationJson: string | null } };
const statuses = ["NEW", "CONTACTED", "SCHEDULED", "COMPLETED", "CLOSED"];

export function InstallerLeadList({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(id: string, status: string) {
    setSavingId(id); setError("");
    try {
      const response = await fetch(`/api/installer/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to update the survey request.");
      setLeads((current) => current.map((lead) => lead.id === id ? { ...lead, status: data.status } : lead));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to update the survey request."); } finally { setSavingId(null); }
  }

  if (!leads.length) return <p className="empty-state">No survey requests have been assigned to you yet.</p>;
  return <><p className="form-message" role="status">{error}</p><div className="lead-list">{leads.map((lead) => <article key={lead.id}>
    <div><p className="eyebrow"><span data-no-translate>{lead.assessment.city}</span> · received {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(lead.createdAt))}</p><h2 data-no-translate>{lead.name}</h2><a data-no-translate href={`tel:${lead.phone}`}>{lead.phone}</a></div>
    <dl><div><dt>Location</dt><dd>{lead.assessment.city}, {lead.assessment.state}</dd></div><div><dt>Roof area</dt><dd>{lead.assessment.roofAreaSqFt.toLocaleString("en-IN")} sq ft</dd></div><div><dt>Roof source</dt><dd>{lead.assessment.areaSource}{lead.assessment.areaLocation ? ` · ${lead.assessment.areaLocation}` : ""}</dd></div><div><dt>Roof type</dt><dd>{lead.assessment.roofType}</dd></div><div><dt>Rainfall</dt><dd>{lead.assessment.annualRainfallMm.toLocaleString("en-IN")} mm · {lead.assessment.rainfallSource}</dd></div><div><dt>Household</dt><dd>{lead.assessment.occupants} people</dd></div><div><dt>Building</dt><dd>{lead.assessment.buildingType}</dd></div><div><dt>Space</dt><dd>{lead.assessment.availableSpace}</dd></div><div><dt>Recommended system</dt><dd>{lead.recommendationSystem || "To be confirmed"}</dd></div><div><dt>Suggested storage</dt><dd>{lead.assessment.suggestedTankLitres.toLocaleString("en-IN")} L</dd></div></dl>
    <label>Survey status<select value={lead.status} disabled={savingId === lead.id} onChange={(event) => updateStatus(lead.id, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}</select></label>{lead.quoteCountRequested > 0 && <p className="field-help">Homeowner requested {lead.quoteCountRequested} quotes · {lead.quotes.length} added.</p>}<QuoteEntryForm leadId={lead.id} />
  </article>)}</div></>;
}
