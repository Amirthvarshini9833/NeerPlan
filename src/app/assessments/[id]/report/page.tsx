import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { ComplianceChecklist } from "@/components/compliance-checklist";
import { ReportActions } from "@/components/report-actions";
import { authOptions } from "@/lib/auth";
import { getGovernmentSchemes } from "@/lib/government-schemes";
import { prisma } from "@/lib/prisma";
import type { InstallationRecommendation } from "@/lib/calculations";

const format = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

export default async function AssessmentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const { id } = await params;
  const assessment = await prisma.assessment.findFirst({ where: { id, user: { email: session.user.email } } });
  if (!assessment) notFound();
  let recommendation: InstallationRecommendation | null = null;
  try { recommendation = assessment.recommendationJson ? JSON.parse(assessment.recommendationJson) as InstallationRecommendation : null; } catch { recommendation = null; }
  const governmentSchemes = getGovernmentSchemes(assessment.state);

  return <main className="report-page">
    <ReportActions />
    <article className="report-sheet">
      <header><p className="eyebrow">NEERPLAN · ASSESSMENT REPORT</p><h1>Rooftop rainwater potential</h1><p><span data-no-translate>{assessment.city}</span> · prepared {new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(assessment.createdAt)}</p></header>
      <section className="report-grid" aria-label="Assessment results">
        <article><span>Annual collection</span><strong>{format(assessment.annualCollectionLitres)} L</strong></article>
        <article><span>Suggested storage</span><strong>{format(assessment.suggestedTankLitres)} L</strong></article>
        <article><span>Estimated annual savings</span><strong>₹{format(assessment.estimatedSavingsInr)}</strong></article>
        <article><span>Indicative payback</span><strong>{assessment.paybackYears.toFixed(1)} years</strong></article>
      </section>
      <section className="report-details"><h2>Assessment basis</h2><dl><div><dt>Roof area</dt><dd>{format(assessment.roofAreaSqFt)} sq ft</dd></div><div><dt>Area source</dt><dd data-no-translate>{assessment.areaSource}</dd></div>{assessment.areaLocation && <div><dt>Map location</dt><dd data-no-translate>{assessment.areaLocation}</dd></div>}<div><dt>Roof type</dt><dd data-no-translate>{assessment.roofType}</dd></div><div><dt>Annual rainfall</dt><dd>{format(assessment.annualRainfallMm)} mm</dd></div><div><dt>Rainfall source</dt><dd data-no-translate>{assessment.rainfallSource}</dd></div>{assessment.rainfallDataPeriod && <div><dt>Data period</dt><dd data-no-translate>{assessment.rainfallDataPeriod} average</dd></div>}{assessment.rainfallRetrievedAt && <div><dt>Data retrieved</dt><dd>{new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(assessment.rainfallRetrievedAt)}</dd></div>}<div><dt>Household size</dt><dd>{assessment.occupants} people</dd></div><div><dt>Indicative setup cost</dt><dd>₹{format(assessment.estimatedSetupCostInr)}</dd></div></dl>{assessment.areaDataSourceUrl && <p className="formula">Map data source: <a href={assessment.areaDataSourceUrl} target="_blank" rel="noreferrer">OpenStreetMap contributors</a>.</p>}<p className="formula">This indicative calculation uses roof area, annual rainfall, and a roof-type runoff coefficient. A site survey should confirm dimensions, drainage, water demand, and installation costs.</p></section>
      {recommendation && <section className="report-recommendation"><p className="eyebrow">INSTALLATION RECOMMENDATION</p><h2>{recommendation.system}</h2><p>{recommendation.reason}</p><dl><div><dt>Suggested tank</dt><dd>{format(recommendation.suggestedTankLitres)} L</dd></div><div><dt>Recharge provision</dt><dd>{format(recommendation.rechargeCapacityLitres)} L/year</dd></div><div><dt>Indicative cost range</dt><dd>₹{format(recommendation.costRangeInr[0])}–₹{format(recommendation.costRangeInr[1])}</dd></div></dl><h3>Basic component checklist</h3><ul>{recommendation.components.map((component) => <li key={component}>{component}</li>)}</ul><p className="recommendation-disclaimer">Planning guidance only. A qualified installer or engineer must confirm the final design, soil conditions, structural safety, water quality, permits, and final installation plan.</p></section>}
      <section className="government-schemes" aria-labelledby="government-schemes-heading"><p className="eyebrow">GOVERNMENT SCHEMES &amp; SUPPORT</p><h2 id="government-schemes-heading">Official support routes to check</h2><p className="scheme-intro">These official programmes and resources are matched to <span data-no-translate>{assessment.state}</span>. They are not an approval or guarantee of funding.</p><div className="scheme-list">{governmentSchemes.map((scheme) => <article key={scheme.officialUrl}><p className="scheme-authority">{scheme.authority}</p><h3>{scheme.title}</h3><p>{scheme.summary}</p><p><strong>Government benefit / support:</strong> {scheme.benefit}</p><p><strong>Who can check:</strong> {scheme.eligibility}</p><p><strong>How to check or apply:</strong> {scheme.applicationRoute}</p><a href={scheme.officialUrl} target="_blank" rel="noreferrer">View official information ↗</a><small>Source checked: {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(`${scheme.verifiedOn}T00:00:00`))}</small></article>)}</div><p className="scheme-disclaimer">Government schemes, rules, budgets, and eligibility can change. Verify the latest details and obtain required local permissions before spending money or relying on assistance.</p></section>
      <ComplianceChecklist state={assessment.state} city={assessment.city} buildingType={assessment.buildingType} initialStatus={assessment.complianceStatus} />
      <footer>This report is an estimate, not an engineering design, water-quality certification, or legal approval.</footer>
    </article>
  </main>;
}
