import Link from "next/link";
import { AdminShell } from "@/components/admin-shell";
import { Icon } from "@/components/icons";
import { requireSession } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireSession();
  const prisma = getPrisma();
  const [stats, upcoming] = prisma ? await Promise.all([
    Promise.all([
      prisma.article.count({ where: { status: "PUBLISHED" } }).catch(() => 0),
      prisma.article.count({ where: { status: "DRAFT" } }).catch(() => 0),
      prisma.contactMessage.count({ where: { status: "UNREAD" } }).catch(() => 0)
    ]),
    prisma.match.findFirst({ where: { kickoffAt: { gte: new Date() }, status: "SCHEDULED" }, orderBy: { kickoffAt: "asc" } }).catch(() => null)
  ]) : [[0, 0, 0], null] as const;
  return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Bonjour {session.user.name?.split(" ")[0] || ""}</p><h1>Vue d’ensemble</h1></div><Link href="/" className="button button--outline">Voir le site <Icon name="external" size={15} /></Link></div><div className="admin-stat-grid"><div className="admin-stat"><span>Articles publiés</span><strong>{stats[0]}</strong><small>Visibles sur le site</small></div><div className="admin-stat"><span>Brouillons</span><strong>{stats[1]}</strong><small>En cours de rédaction</small></div><div className="admin-stat"><span>Messages non lus</span><strong>{stats[2]}</strong><small>Demandes à traiter</small></div></div><div className="admin-content-grid"><section className="admin-card"><div className="admin-card__head"><div><p className="eyebrow">Raccourcis</p><h2>Actions courantes</h2></div></div><div className="admin-actions"><Link href="/admin/articles"><span>+</span><strong>Écrire un article</strong><small>Créer, modifier ou publier</small></Link><Link href="/admin/matchs"><span>◷</span><strong>Ajouter un match</strong><small>Calendrier et résultat</small></Link><Link href="/admin/effectif"><span>♙</span><strong>Mettre à jour l’effectif</strong><small>Joueurs et staff</small></Link><Link href="/admin/classement"><span>♜</span><strong>Mettre à jour le classement</strong><small>Table complète et points</small></Link><Link href="/admin/medias"><span>▧</span><strong>Ajouter une image</strong><small>Bibliothèque média</small></Link><Link href="/admin/messages"><span>✉</span><strong>Voir les messages</strong><small>Suivre les demandes reçues</small></Link></div></section><section className="admin-card"><div className="admin-card__head"><div><p className="eyebrow">Prochain rendez-vous</p><h2>Calendrier</h2></div><Link href="/admin/matchs" className="text-link">Gérer</Link></div>{upcoming ? <div style={{ padding: "0 24px 24px" }}><p style={{ color: "#6e6b65" }}>Un match est programmé prochainement. Vérifiez les informations depuis le module Matchs.</p></div> : <div className="admin-empty">Aucun match programmé.</div>}</section></div></AdminShell>;
}
