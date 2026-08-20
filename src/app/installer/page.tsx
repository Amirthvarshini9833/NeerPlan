import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { InstallerLeadList } from "@/components/installer-lead-list";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function InstallerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const installer = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (!installer || installer.role !== "INSTALLER") redirect("/dashboard");
  const leads = await prisma.installerLead.findMany({
    where: { installerId: installer.id },
    include: { assessment: { select: { city: true, state: true, roofAreaSqFt: true, areaSource: true, areaLocation: true, roofType: true, annualRainfallMm: true, rainfallSource: true, occupants: true, buildingType: true, availableSpace: true, suggestedTankLitres: true, quoteCountRequested: true, recommendationJson: true } }, quotes: { orderBy: { priceInr: "asc" } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  const initialLeads = leads.map((lead) => { let recommendationSystem = ""; try { recommendationSystem = lead.assessment.recommendationJson ? JSON.parse(lead.assessment.recommendationJson).system ?? "" : ""; } catch { recommendationSystem = ""; } return { ...lead, quoteCountRequested: lead.assessment.quoteCountRequested, recommendationSystem, createdAt: lead.createdAt.toISOString(), quotes: lead.quotes.map((quote) => ({ ...quote, createdAt: quote.createdAt.toISOString(), installationDate: quote.installationDate?.toISOString() ?? null })) }; });
  return <main className="installer-dashboard"><p className="eyebrow">INSTALLER PORTAL</p><h1>Site-survey requests</h1><p>Review assigned rooftop assessments and keep each homeowner informed as the survey progresses.</p><InstallerLeadList initialLeads={initialLeads} /></main>;
}
