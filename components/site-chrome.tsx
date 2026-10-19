"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";

export function SiteChrome({ logoUrl, footer, children }: { logoUrl?: string | null; footer: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return <main id="contenu">{children}</main>;
  return <><Header logoUrl={logoUrl} /><main id="contenu">{children}</main>{footer}</>;
}
