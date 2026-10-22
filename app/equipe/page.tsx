import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getSquad } from "@/lib/site-data";
import { calculateAge } from "@/lib/format";

export const revalidate = 60;

const groups = [{ key: "GOALKEEPER", label: "Gardiens" }, { key: "DEFENDER", label: "Défenseurs" }, { key: "MIDFIELDER", label: "Milieux" }, { key: "FORWARD", label: "Attaquants" }];

export default async function SquadPage() {
  const { season, players, staff } = await getSquad();
  return <div><section className="page-intro"><div className="container page-intro__row"><div><p className="eyebrow">Saison · {season?.name || "à renseigner"}</p><h1>L’effectif</h1></div><p>Les fiches joueurs, les postes et la composition du staff sont organisés par saison.</p></div></section><section className="section"><div className="container">{groups.map((group) => { const list = players.filter((player) => player.position === group.key || player.position === group.label); if (!list.length) return null; return <div key={group.key} style={{ marginBottom: 62 }}><SectionHeading eyebrow="L’équipe première" title={group.label} /><div className="mini-players">{list.map((player) => <Link href={`/equipe/${player.slug}`} className="player-tile" key={player.id}><div className="player-tile__image"><Image src={player.imageUrl || "/images/logo-dcb.jpeg"} alt={player.imageAlt || `Portrait de ${player.name}`} fill sizes="(max-width: 600px) 50vw, 25vw" /><span className="player-tile__number">{player.number ?? "—"}</span></div><div className="player-tile__body"><small>{group.label.slice(0, -1)}</small><strong>{player.name}</strong>{calculateAge(player.birthDate) && <span style={{ display: "block", color: "#87847e", fontSize: 11, marginTop: 5 }}>{calculateAge(player.birthDate)} ans</span>}</div></Link>)}</div></div>})}{staff.length > 0 && <div><SectionHeading eyebrow="Autour de l’équipe" title="Le staff" /><div className="news-list">{staff.map((member) => <article className="panel" style={{ padding: 24 }} key={member.id}><p className="eyebrow">{member.role}</p><h3 style={{ fontFamily: "Inter", fontWeight: 800, letterSpacing: 0 }}>{member.name}</h3><p style={{ color: "#706d67", fontSize: 14 }}>{member.bio}</p></article>)}</div></div>}</div></section></div>;
}
