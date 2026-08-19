import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { ComplianceChecklist } from "@/components/compliance-checklist";
import { ReportActions } from "@/components/report-actions";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const format = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

export default async function AssessmentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const { id } = await params;
  const assessment = await prisma.assessment.findFirst({ where: { id, user: { email: session.user.email } } });
  if (!assessment) notFound();

  return <main className="report-page">
    <ReportActions />
    <article className="report-sheet">
      <header><p className="eyebrow">NEERPLAN · ASSESSMENT REPORT</p><h1>Rooftop rainwater potential</h1><p>{assessment.city} · prepared {new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(assessment.createdAt)}</p></header>
      <section className="report-grid" aria-label="Assessment results">
        <article><span>Annual collection</span><strong>{format(assessment.annualCollectionLitres)} L</strong></article>
        <article><span>Suggested storage</span><strong>{format(assessment.suggestedTankLitres)} L</strong></article>
        <article><span>Estimated annual savings</span><strong>₹{format(assessment.estimatedSavingsInr)}</strong></article>
        <article><span>Indicative payback</span><strong>{assessment.paybackYears.toFixed(1)} years</strong></article>
      </section>
      <section className="report-details"><h2>Assessment basis</h2><dl><div><dt>Roof area</dt><dd>{format(assessment.roofAreaSqFt)} sq ft</dd></div><div><dt>Roof type</dt><dd>{assessment.roofType}</dd></div><div><dt>Annual rainfall</dt><dd>{format(assessment.annualRainfallMm)} mm</dd></div><div><dt>Household size</dt><dd>{assessment.occupants} people</dd></div><div><dt>Indicative setup cost</dt><dd>₹{format(assessment.estimatedSetupCostInr)}</dd></div></dl><p className="formula">This indicative calculation uses roof area, annual rainfall, and a roof-type runoff coefficient. A site survey should confirm dimensions, drainage, water demand, and installation costs.</p></section>
      <ComplianceChecklist />
      <footer>This report is an estimate, not an engineering design, quotation, water-quality certification, or legal approval.</footer>
    </article>
  </main>;
}
