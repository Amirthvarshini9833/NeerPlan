import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/login");
  const admin = await prisma.user.findUnique({ where: { email: session.user.email }, select: { role: true } });
  if (admin?.role !== "ADMIN") redirect(admin?.role === "INSTALLER" ? "/installer" : "/dashboard");
  const [users, assessments, leads] = await Promise.all([prisma.user.count(), prisma.assessment.count(), prisma.installerLead.count({ where: { status: { not: "COMPLETED" } } })]);
  return <main className="admin-dashboard"><p className="eyebrow">ADMIN CONTROL CENTER</p><h1>Manage NeerPlan operations.</h1><p>Oversee users, assessments, site-survey requests, installers, and compliance guidance.</p><section className="admin-metrics"><article><span>Users</span><strong>{users}</strong></article><article><span>Assessments</span><strong>{assessments}</strong></article><article><span>Open survey requests</span><strong>{leads}</strong></article></section><section className="admin-panels"><article><h2>User and installer management</h2><p>Review account roles and keep installer access limited to approved partners.</p></article><article><h2>Survey assignment</h2><p>Assign requests to available installers and monitor progress from new to completed.</p></article><article><h2>Compliance guidance</h2><p>Maintain state-specific guidance and official links. Confirm changes with the relevant municipality.</p></article></section></main>;
}
