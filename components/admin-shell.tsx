"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icons";

const links = [{ href: "/admin", label: "Vue d’ensemble", icon: "arrow" as const }, { href: "/admin/articles", label: "Articles", icon: "search" as const }, { href: "/admin/matchs", label: "Matchs", icon: "calendar" as const }, { href: "/admin/classement", label: "Classement", icon: "trophy" as const }, { href: "/admin/effectif", label: "Effectif", icon: "user" as const }, { href: "/admin/referentiels", label: "Référentiels", icon: "calendar" as const }, { href: "/admin/club", label: "Le club", icon: "trophy" as const }, { href: "/admin/partenaires", label: "Partenaires", icon: "user" as const }, { href: "/admin/medias", label: "Médias", icon: "search" as const }, { href: "/admin/messages", label: "Messages", icon: "mail" as const }, { href: "/admin/parametres", label: "Paramètres", icon: "trophy" as const }];

export function AdminShell({ children, user }: { children: React.ReactNode; user: { name?: string | null; email?: string | null; role?: string } }) {
  const pathname = usePathname();
  return <div className="admin-layout"><aside className="admin-sidebar"><Link href="/" className="admin-brand"><span>DCB</span><small>Administration</small></Link><nav aria-label="Navigation administration">{links.map((link) => <Link href={link.href} key={link.href} className={pathname === link.href ? "active" : ""}><Icon name={link.icon} size={17} />{link.label}</Link>)}</nav><div className="admin-sidebar__bottom"><span className="admin-user"><strong>{user.name || user.email}</strong><small>{user.role === "ADMIN" ? "Administrateur" : "Éditeur"}</small></span><button type="button" onClick={() => signOut({ callbackUrl: "/" })}>Se déconnecter</button></div></aside><main className="admin-main">{children}</main></div>;
}
