import { getServerSession } from "next-auth";
import Link from "next/link";
import { authOptions } from "@/lib/auth";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);

  return (
    <header className="site-header">
      <Link className="brand" href="/">Neer<span>Plan</span></Link>
      <nav aria-label="Primary navigation">
        <Link href="/#assessment">Assessment</Link>
        {session?.user?.email ? <><Link href="/dashboard">Dashboard</Link><Link href="/installer">Installer portal</Link></> : <Link href="/login">Sign in</Link>}
      </nav>
    </header>
  );
}
