"use client";
import { useState } from "react";
import Link from "next/link";
import { calculateAssessment, type AssessmentInput } from "@/lib/calculations";
import { InstallerLeadForm } from "@/components/installer-lead-form";
const rain: Record<string, number> = { bengaluru: 970, chennai: 1400, mumbai: 2200, delhi: 800, pune: 720, hyderabad: 900, kolkata: 1600, kochi: 3000, ahmedabad: 800 };
const format = (n: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
export function AssessmentForm() {
  const [input, setInput] = useState<AssessmentInput>({ city: "Bengaluru", roofAreaSqFt: 1200, roofType: "concrete", annualRainfallMm: 970, occupants: 4 });
  const [result, setResult] = useState<ReturnType<typeof calculateAssessment> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);
  const update = (key: keyof AssessmentInput, value: string) => setInput(current => ({ ...current, [key]: key === "city" ? value : key === "roofType" ? value : Number(value) } as AssessmentInput));
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setLoading(true); try { const response = await fetch("/api/assessments/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }); const data = await response.json(); if (!response.ok) throw new Error(data.error); setResult(data.result); } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to calculate."); } finally { setLoading(false); } }
  async function saveAssessment() {
    setSaveMessage("");
    setSaving(true);
    try {
      const response = await fetch("/api/assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data = await response.json();
      if (response.status === 401) { setSaveMessage("Sign in or create an account to save this assessment."); return; }
      if (!response.ok) throw new Error(data.error ?? "Unable to save this assessment.");
      setSavedAssessmentId(data.id);
      setSaveMessage("Assessment saved to your dashboard.");
    } catch (reason) { setSaveMessage(reason instanceof Error ? reason.message : "Unable to save this assessment."); } finally { setSaving(false); }
  }
  return <section className="assessment"><div><p className="eyebrow">FREE ASSESSMENT</p><h2>Understand your rooftop potential.</h2><p>Every estimate shows its calculation basis and can be refined during a site survey.</p></div><form onSubmit={submit}><label>City<input value={input.city} onChange={e => { update("city", e.target.value); const value = rain[e.target.value.toLowerCase()]; if (value) update("annualRainfallMm", String(value)); }} /></label><div className="fields"><label>Roof area (sq ft)<input type="number" min="20" value={input.roofAreaSqFt} onChange={e => update("roofAreaSqFt", e.target.value)} /></label><label>Roof type<select value={input.roofType} onChange={e => update("roofType", e.target.value)}><option value="concrete">Concrete terrace</option><option value="metal">Metal roof</option><option value="tiles">Tiled roof</option></select></label></div><div className="fields"><label>Annual rainfall (mm)<input type="number" min="100" value={input.annualRainfallMm} onChange={e => update("annualRainfallMm", e.target.value)} /></label><label>People using water<input type="number" min="1" value={input.occupants} onChange={e => update("occupants", e.target.value)} /></label></div><button disabled={loading}>{loading ? "Calculating…" : "Calculate my potential →"}</button>{error && <p className="error">{error}</p>}</form>{result && <div className="results"><p className="eyebrow">YOUR ESTIMATE</p><div className="cards"><article><span>Annual collection</span><strong>{format(result.annualCollectionLitres)} L</strong></article><article><span>Suggested storage</span><strong>{format(result.suggestedTankLitres)} L</strong></article><article><span>Annual savings</span><strong>₹{format(result.estimatedSavingsInr)}</strong></article><article><span>Expected payback</span><strong>{result.paybackYears.toFixed(1)} years</strong></article></div><p className="formula">{result.areaSqM.toFixed(1)} sq m × {input.annualRainfallMm} mm × {result.runoffCoefficient} runoff coefficient. Indicative setup cost: ₹{format(result.estimatedSetupCostInr)}.</p><div className="result-actions">{savedAssessmentId ? <Link href="/dashboard" className="button-link">View dashboard</Link> : <button onClick={saveAssessment} disabled={saving}>{saving ? "Saving…" : "Save assessment"}</button>} {saveMessage && <p className="form-message" role="status">{saveMessage}{saveMessage.startsWith("Sign in") && <> <Link href="/login">Sign in</Link></>}</p>}</div>{savedAssessmentId && <InstallerLeadForm assessmentId={savedAssessmentId} />}</div>}</section>;
}
