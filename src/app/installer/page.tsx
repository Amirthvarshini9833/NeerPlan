import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { InstallerLeadList } from "@/components/installer-lead-list";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function InstallerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const installer = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (!installer || !["INSTALLER", "ADMIN"].includes(installer.role)) redirect("/dashboard");
  const leads = await prisma.installerLead.findMany({
    where: installer.role === "ADMIN" ? {} : { installerId: installer.id },
    include: { assessment: { select: { city: true, roofAreaSqFt: true, suggestedTankLitres: true } } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });
  const initialLeads = leads.map((lead) => ({ ...lead, createdAt: lead.createdAt.toISOString() }));
  return <main className="installer-dashboard"><p className="eyebrow">INSTALLER PORTAL</p><h1>Site-survey requests</h1><p>Review assigned rooftop assessments and keep each homeowner informed as the survey progresses.</p><InstallerLeadList initialLeads={initialLeads} /></main>;
}
