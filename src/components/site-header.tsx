"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage } from "@/components/language-provider";

export function SiteHeader() {
  const { data: session } = useSession();
  const { t } = useLanguage();

  return (
    <header className="site-header">
      <Link className="brand" href="/">Neer<span>Plan</span></Link>
      <nav aria-label="Primary navigation">
        <Link href="/#assessment">{t("assessment")}</Link>
        {session?.user?.email ? <>{session.user.role === "ADMIN" ? <Link href="/admin">Admin</Link> : session.user.role === "INSTALLER" ? <Link href="/installer">{t("installer")}</Link> : <Link href="/dashboard">{t("dashboard")}</Link>}<button className="header-signout" type="button" onClick={() => signOut({ callbackUrl: "/" })}>Logout</button></> : <Link href="/login">{t("signIn")}</Link>}<LanguageSelector />
      </nav>
    </header>
  );
}
