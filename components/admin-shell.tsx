"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

const links = [
  { href: "/admin", label: "Vue d’ensemble", icon: "arrow" as const },
  { href: "/admin/articles", label: "Articles", icon: "search" as const },
  { href: "/admin/matchs", label: "Matchs", icon: "calendar" as const },
  { href: "/admin/classement", label: "Classement", icon: "trophy" as const },
  { href: "/admin/effectif", label: "Effectif", icon: "user" as const },
  { href: "/admin/referentiels", label: "Référentiels", icon: "calendar" as const },
  { href: "/admin/club", label: "Le club", icon: "trophy" as const },
  { href: "/admin/partenaires", label: "Partenaires", icon: "user" as const },
  { href: "/admin/medias", label: "Médias", icon: "search" as const },
  { href: "/admin/messages", label: "Messages", icon: "mail" as const },
  { href: "/admin/parametres", label: "Paramètres", icon: "trophy" as const }
];
const accountLink = { href: "/admin/utilisateurs", label: "Comptes", icon: "user" as const };

export function AdminShell({ children, user }: { children: React.ReactNode; user: { id?: string; name?: string | null; email?: string | null; role?: string } }) {
  const pathname = usePathname();
  const navigation = user.role === "ADMIN" ? [...links, accountLink] : links;
  const displayName = user.name || user.email || "Administrateur";
  const initials = displayName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return <div className="admin-layout">
    <aside className="admin-sidebar">
      <Link href="/admin" className="admin-brand" aria-label="Administration DC Boghni">
        <span className="admin-brand__mark"><img src="/images/logo-dcb.jpeg" alt="" /></span>
        <span className="admin-brand__words"><strong>DC BOGHNI</strong><small>Centre de contrôle</small></span>
      </Link>
      <div className="admin-sidebar__rule" />
      <p className="admin-nav-label">Gestion du club</p>
      <nav aria-label="Navigation administration">{navigation.map((link) => <Link href={link.href} key={link.href} className={pathname === link.href ? "active" : ""}><Icon name={link.icon} size={17} />{link.label}</Link>)}</nav>
      <div className="admin-sidebar__bottom">
        <div className="admin-user-card"><span className="admin-user-card__avatar">{initials}</span><span className="admin-user"><strong>{displayName}</strong><small>{user.role === "ADMIN" ? "Administrateur" : "Éditeur"}</small></span></div>
        <button className="admin-signout" type="button" onClick={() => signOut({ callbackUrl: "/" })}>Se déconnecter <Icon name="arrow" size={14} /></button>
      </div>
    </aside>
    <section className="admin-workspace">
      <div className="admin-topbar"><div><span className="admin-topbar__kicker">DCB / Administration</span><span className="admin-topbar__status"><i /> Session sécurisée</span></div><Link href="/" className="admin-site-link">Voir le site <Icon name="external" size={15} /></Link></div>
      <main className="admin-main">{children}</main>
    </section>
  </div>;
}
