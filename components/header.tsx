"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ClubCrest } from "@/components/club-crest";
import { Icon } from "@/components/icons";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/actualites", label: "Actualités" },
  { href: "/calendrier", label: "Calendrier" },
  { href: "/classement", label: "Classement" },
  { href: "/equipe", label: "Effectif" },
  { href: "/club", label: "Le club" }
];

export function Header({ logoUrl = "/images/logo-dcb.jpeg" }: { logoUrl?: string | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isPublic = !pathname?.startsWith("/admin");
  return <header className={`site-header ${isPublic ? "site-header--overlay" : ""}`}>
    <a className="skip-link" href="#contenu">Aller au contenu</a>
    <div className="container site-header__inner">
      <Link href="/" className="brand" aria-label="DC Boghni, accueil" onClick={() => setOpen(false)}><ClubCrest size="sm" src={logoUrl || "/images/logo-dcb.jpeg"} /><span><strong>DC BOGHNI</strong><small>Depuis la Kabylie</small></span></Link>
      <nav id="navigation" className={`main-nav ${open ? "main-nav--open" : ""}`} aria-label="Navigation principale">
        {links.map((link) => <Link key={link.href} href={link.href} aria-current={pathname === link.href ? "page" : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
        <Link href="/contact" className="nav-contact" onClick={() => setOpen(false)}>Nous contacter <Icon name="arrow" size={16} /></Link>
      </nav>
      <button className="menu-button" type="button" aria-expanded={open} aria-controls="navigation" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} onClick={() => setOpen((value) => !value)}><Icon name={open ? "close" : "menu"} /></button>
    </div>
  </header>;
}
