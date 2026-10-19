import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { calculateAge } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const prisma = getPrisma();
  if (!prisma) notFound();
  const player = await prisma.player.findUnique({ where: { slug }, include: { season: true } }).catch(() => null);
  if (!player || !player.active) notFound();
  const label = { GOALKEEPER: "Gardien", DEFENDER: "Défenseur", MIDFIELDER: "Milieu", FORWARD: "Attaquant" }[player.position];
  return <div><section className="page-intro"><div className="container"><p className="eyebrow">{label} · {player.season?.name || "Saison à renseigner"}</p><h1>{player.name}</h1></div></section><section className="section section--tight"><div className="container club-page-grid"><div className="panel"><div style={{ position: "relative", aspectRatio: "1/1" }}><Image src={player.imageUrl || "/images/logo-dcb.jpeg"} alt={player.imageAlt || `Portrait de ${player.name}`} fill sizes="(max-width: 900px) 100vw, 50vw" style={{ objectFit: "cover", filter: "grayscale(1)" }} /></div></div><div><p className="eyebrow">Fiche joueur</p><div style={{ display: "grid", gap: 18, marginTop: 22 }}><div><span className="panel__title">Numéro</span><p style={{ fontFamily: "Impact", fontSize: 42, margin: 0 }}>{player.number ?? "—"}</p></div>{player.birthDate && <div><span className="panel__title">Âge</span><p style={{ fontSize: 18, margin: "3px 0 0" }}>{calculateAge(player.birthDate)} ans</p></div>}<div><span className="panel__title">Poste</span><p style={{ fontSize: 18, margin: "3px 0 0" }}>{label}</p></div><p style={{ color: "#68655f", whiteSpace: "pre-line" }}>{player.bio || "Biographie à renseigner."}</p></div><Link className="text-link" href="/equipe" style={{ marginTop: 25 }}>Retour à l’effectif</Link></div></div></section></div>;
}
