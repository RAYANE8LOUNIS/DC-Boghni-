"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/header";

export function SiteChrome({ logoUrl, footer }: { logoUrl?: string | null; footer: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <><Header logoUrl={logoUrl} />{footer}</>;
}
