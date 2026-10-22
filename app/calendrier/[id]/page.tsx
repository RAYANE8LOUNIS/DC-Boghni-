import Link from "next/link";
import { notFound } from "next/navigation";
import { MatchCard } from "@/components/match-card";
import { getMatchById } from "@/lib/site-data";
import { formatDate } from "@/lib/format";

export const revalidate = 30;

export default async function MatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await getMatchById(id);
  if (!match) notFound();
  return <div><section className="page-intro"><div className="container page-intro__row"><div><p className="eyebrow">{match.competition.name} · {match.season.name}</p><h1>Détail du match</h1></div><p>{formatDate(match.kickoffAt)} · {match.venue || "Stade à renseigner"}</p></div></section><section className="section section--tight"><div className="container"><MatchCard match={match} />{match.report && <article className="panel" style={{ marginTop: 22, padding: 28 }}><p className="eyebrow">Compte rendu</p><p style={{ whiteSpace: "pre-line", color: "#5e5b55" }}>{match.report}</p></article>}<Link href="/calendrier" className="text-link" style={{ marginTop: 25 }}>Retour au calendrier</Link></div></section></div>;
}
