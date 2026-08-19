"use client";

import Link from "next/link";
import { useState } from "react";
import { InstallerLeadForm } from "@/components/installer-lead-form";
import { RooftopMapPicker, type AreaSelection } from "@/components/rooftop-map-picker";
import { calculateAssessment, type AssessmentInput } from "@/lib/calculations";

type RainfallProvenance = { source: string; period?: string; retrievedAt?: string; sourceUrl?: string; location?: string };
const manualProvenance: RainfallProvenance = { source: "Manual user input" };
const manualAreaProvenance = { source: "Manual user input" };
const format = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);
const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));

export function AssessmentForm() {
  const [input, setInput] = useState<AssessmentInput>({ city: "Bengaluru", roofAreaSqFt: 1200, roofType: "concrete", annualRainfallMm: 970, occupants: 4 });
  const [result, setResult] = useState<ReturnType<typeof calculateAssessment> | null>(null);
  const [provenance, setProvenance] = useState<RainfallProvenance>(manualProvenance);
  const [areaProvenance, setAreaProvenance] = useState<{ source: string; sourceUrl?: string; location?: string }>(manualAreaProvenance);
  const [loading, setLoading] = useState(false);
  const [estimatingRainfall, setEstimatingRainfall] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [rainfallMessage, setRainfallMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [savedAssessmentId, setSavedAssessmentId] = useState<string | null>(null);

  function update(key: keyof AssessmentInput, value: string) {
    setInput((current) => ({ ...current, [key]: key === "city" || key === "roofType" ? value : Number(value) } as AssessmentInput));
    if (key === "annualRainfallMm") { setProvenance(manualProvenance); setRainfallMessage("Manual rainfall value selected."); }
    if (key === "roofAreaSqFt") { setAreaProvenance(manualAreaProvenance); }
    if (key === "city") { setProvenance(manualProvenance); setRainfallMessage(""); setSavedAssessmentId(null); }
  }

  async function useLocationEstimate() {
    setRainfallMessage("");
    setEstimatingRainfall(true);
    try {
      const response = await fetch(`/api/rainfall?city=${encodeURIComponent(input.city)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to retrieve a rainfall estimate.");
      setInput((current) => ({ ...current, annualRainfallMm: data.annualRainfallMm }));
      setProvenance({ source: data.source, period: data.period, retrievedAt: data.retrievedAt, sourceUrl: data.sourceUrl, location: data.location });
      setRainfallMessage(`Applied ${format(data.annualRainfallMm)} mm/year for ${data.location}. You can still edit it manually.`);
      setSavedAssessmentId(null);
    } catch (reason) { setRainfallMessage(reason instanceof Error ? reason.message : "Your current manual rainfall value is unchanged."); } finally { setEstimatingRainfall(false); }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/assessments/calculate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to calculate.");
      setResult(data.result);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Unable to calculate."); } finally { setLoading(false); }
  }

  async function saveAssessment() {
    setSaveMessage(""); setSaving(true);
    try {
      const response = await fetch("/api/assessments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...input, areaSource: areaProvenance.source, areaDataSourceUrl: areaProvenance.sourceUrl, areaLocation: areaProvenance.location, rainfallSource: provenance.source, rainfallDataPeriod: provenance.period, rainfallRetrievedAt: provenance.retrievedAt }) });
      const data = await response.json();
      if (response.status === 401) { setSaveMessage("Sign in or create an account to save this assessment."); return; }
      if (!response.ok) throw new Error(data.error ?? "Unable to save this assessment.");
      setSavedAssessmentId(data.id); setSaveMessage("Assessment saved to your dashboard.");
    } catch (reason) { setSaveMessage(reason instanceof Error ? reason.message : "Unable to save this assessment."); } finally { setSaving(false); }
  }

  function applyAreaSelection(selection: AreaSelection | null) {
    if (!selection) { setAreaProvenance(manualAreaProvenance); return; }
    setInput((current) => ({ ...current, roofAreaSqFt: selection.areaSqFt }));
    setAreaProvenance((current) => ({ source: selection.source, sourceUrl: selection.sourceUrl, location: selection.location ?? current.location }));
    setSavedAssessmentId(null);
  }

  return <section className="assessment"><div><p className="eyebrow">FREE ASSESSMENT</p><h2>Understand your rooftop potential.</h2><p>Every estimate shows its calculation basis and can be refined during a site survey.</p></div><form onSubmit={submit}><label>City<input value={input.city} onChange={(event) => update("city", event.target.value)} /></label><RooftopMapPicker initialQuery={input.city} onAreaChange={applyAreaSelection} onLocationChange={(location) => { setInput((current) => ({ ...current, city: location.split(",")[0] })); setAreaProvenance((current) => ({ ...current, location })); }} /><div className="fields"><label>Roof area (sq ft)<input type="number" min="20" max="100000" value={input.roofAreaSqFt} onChange={(event) => update("roofAreaSqFt", event.target.value)} /><span className="field-help">You can type your own value at any time. Source: {areaProvenance.source}{areaProvenance.location && <> · {areaProvenance.location}</>}</span></label><label>Roof type<select value={input.roofType} onChange={(event) => update("roofType", event.target.value)}><option value="concrete">Concrete terrace</option><option value="metal">Metal roof</option><option value="tiles">Tiled roof</option></select></label></div><div className="fields rainfall-field"><label>Annual rainfall (mm)<input type="number" min="100" value={input.annualRainfallMm} onChange={(event) => update("annualRainfallMm", event.target.value)} /><span className="field-help">You can type your own value at any time.</span></label><div className="rainfall-action"><span>Location-based estimate</span><button type="button" className="secondary-button" disabled={estimatingRainfall || input.city.trim().length < 2} onClick={useLocationEstimate}>{estimatingRainfall ? "Looking up…" : "Use city estimate"}</button></div></div><div className="rainfall-source" role="status"><strong>Rainfall source:</strong> {provenance.source}{provenance.period && <> · {provenance.period} average</>}{provenance.retrievedAt && <> · retrieved {formatDate(provenance.retrievedAt)}</>}{provenance.sourceUrl && <> · <a href={provenance.sourceUrl} target="_blank" rel="noreferrer">About this data</a></>}</div>{rainfallMessage && <p className="form-message" role="status">{rainfallMessage}</p>}<label>People using water<input type="number" min="1" value={input.occupants} onChange={(event) => update("occupants", event.target.value)} /></label><button disabled={loading}>{loading ? "Calculating…" : "Calculate my potential →"}</button>{error && <p className="error">{error}</p>}</form>{result && <div className="results"><p className="eyebrow">YOUR ESTIMATE</p><div className="cards"><article><span>Annual collection</span><strong>{format(result.annualCollectionLitres)} L</strong></article><article><span>Suggested storage</span><strong>{format(result.suggestedTankLitres)} L</strong></article><article><span>Annual savings</span><strong>₹{format(result.estimatedSavingsInr)}</strong></article><article><span>Expected payback</span><strong>{result.paybackYears.toFixed(1)} years</strong></article></div><p className="formula">{result.areaSqM.toFixed(1)} sq m × {input.annualRainfallMm} mm × {result.runoffCoefficient} runoff coefficient. Indicative setup cost: ₹{format(result.estimatedSetupCostInr)}.</p><div className="result-actions">{savedAssessmentId ? <Link href="/dashboard" className="button-link">View dashboard</Link> : <button onClick={saveAssessment} disabled={saving}>{saving ? "Saving…" : "Save assessment"}</button>} {saveMessage && <p className="form-message" role="status">{saveMessage}{saveMessage.startsWith("Sign in") && <> <Link href="/login">Sign in</Link></>}</p>}</div>{savedAssessmentId && <InstallerLeadForm assessmentId={savedAssessmentId} />}</div>}</section>;
}
