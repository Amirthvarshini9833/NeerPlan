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
      <Link className="brand" href="/" data-no-translate>Neer<span>Plan</span></Link>
      <nav aria-label="Primary navigation">
        <Link href="/#assessment" data-no-translate>{t("assessment")}</Link>
        {session?.user?.email ? <>{session.user.role === "ADMIN" ? <Link href="/admin">Admin</Link> : session.user.role === "INSTALLER" ? <Link href="/installer" data-no-translate>{t("installer")}</Link> : <Link href="/dashboard" data-no-translate>{t("dashboard")}</Link>}<button className="header-signout" type="button" onClick={() => signOut({ callbackUrl: "/" })}>Logout</button></> : <Link href="/login" data-no-translate>{t("signIn")}</Link>}<LanguageSelector />
      </nav>
    </header>
  );
}
