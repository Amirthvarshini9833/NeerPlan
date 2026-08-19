import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const format = (value: number) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value);

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  if (session.user.role === "ADMIN") redirect("/admin");
  if (session.user.role === "INSTALLER") redirect("/installer");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { assessments: { orderBy: { createdAt: "desc" }, take: 12 } },
  });
  const assessments = user?.assessments ?? [];

  return <main className="dashboard">
    <p className="eyebrow">YOUR DASHBOARD</p>
    <h1>Welcome, {session.user.name ?? "there"}.</h1>
    <p>{assessments.length ? "Your recent rooftop assessments." : "Save an assessment to keep its estimate and plan next steps."}</p>
    <a className="dashboard-link" href="/">Start a new assessment →</a>
    {assessments.length > 0 && <section className="assessment-history" aria-labelledby="history-heading">
      <h2 id="history-heading">Saved assessments</h2>
      <div className="history-grid">
        {assessments.map((assessment) => <article key={assessment.id}>
          <p className="eyebrow">{assessment.city} · {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(assessment.createdAt)}</p>
          <strong>{format(assessment.annualCollectionLitres)} L <span>annual collection</span></strong>
          <dl><div><dt>Storage</dt><dd>{format(assessment.suggestedTankLitres)} L</dd></div><div><dt>Setup estimate</dt><dd>₹{format(assessment.estimatedSetupCostInr)}</dd></div><div><dt>Payback</dt><dd>{assessment.paybackYears.toFixed(1)} years</dd></div></dl><Link className="report-link" href={`/assessments/${assessment.id}/report`}>Open printable report</Link>
        </article>)}
      </div>
    </section>}
  </main>;
}
