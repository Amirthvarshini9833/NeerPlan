import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { LanguageProvider } from "@/components/language-provider";

export const metadata: Metadata = {
  title: "NeerPlan | Rooftop rainwater harvesting",
  description: "Plan, assess, and act on rooftop rainwater harvesting.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><LanguageProvider><SiteHeader />{children}</LanguageProvider></body></html>;
}
