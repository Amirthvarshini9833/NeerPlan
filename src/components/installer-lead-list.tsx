"use client";

import { useState } from "react";
import { QuoteEntryForm } from "@/components/quote-entry-form";

type Lead = { id: string; name: string; phone: string; status: string; createdAt: string; quoteCountRequested: number; quotes: { id: string }[]; assessment: { city: string; roofAreaSqFt: number; suggestedTankLitres: number } };
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
    <div><p className="eyebrow">{lead.assessment.city} · received {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(lead.createdAt))}</p><h2>{lead.name}</h2><a href={`tel:${lead.phone}`}>{lead.phone}</a></div>
    <dl><div><dt>Roof area</dt><dd>{lead.assessment.roofAreaSqFt.toLocaleString("en-IN")} sq ft</dd></div><div><dt>Suggested storage</dt><dd>{lead.assessment.suggestedTankLitres.toLocaleString("en-IN")} L</dd></div></dl>
    <label>Survey status<select value={lead.status} disabled={savingId === lead.id} onChange={(event) => updateStatus(lead.id, event.target.value)}>{statuses.map((status) => <option key={status} value={status}>{status.charAt(0) + status.slice(1).toLowerCase()}</option>)}</select></label>{lead.quoteCountRequested > 0 && <p className="field-help">Homeowner requested {lead.quoteCountRequested} quotes · {lead.quotes.length} added.</p>}<QuoteEntryForm leadId={lead.id} />
  </article>)}</div></>;
}
