import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { SiteChrome } from "@/components/site-chrome";
import { getSettings } from "@/lib/site-data";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  title: { default: "DC Boghni — Le club", template: "%s — DC Boghni" },
  description: "Le site du DC Boghni : actualités, calendrier, résultats, classement et effectif.",
  openGraph: { title: "DC Boghni", description: "Une ville. Un maillot. Une histoire à écrire.", images: ["/images/jersey-dcb.jpeg"], type: "website" },
  robots: { index: true, follow: true }
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();
  const theme = { "--ink": settings.primaryColor, "--copper": settings.accentColor } as React.CSSProperties;
  return <html lang="fr"><body style={theme}><SiteChrome logoUrl={settings.logoUrl} footer={<Footer />}>{children}</SiteChrome></body></html>;
}
