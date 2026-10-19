import Link from "next/link";
import { MatchCard } from "@/components/match-card";
import { Icon } from "@/components/icons";
import { getFixtures } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function CalendarPage({ searchParams }: { searchParams: Promise<{ onglet?: string }> }) {
  const params = await searchParams;
  const data = await getFixtures();
  const results = params.onglet === "resultats";
  const list = results ? data.results : data.upcoming;
  return <div><section className="page-intro"><div className="container page-intro__row"><div><p className="eyebrow">Saison sportive</p><h1>Calendrier<br />& résultats</h1></div><p>Les horaires et scores sont ajoutés manuellement par le club. Les résultats en direct ne sont pas simulés.</p></div></section><section className="section"><div className="container"><div className="filters"><div className="field"><label htmlFor="season">Saison</label><select id="season"><option>{data.seasons[0]?.name || "Saison à renseigner"}</option></select></div><div className="field"><label htmlFor="competition">Compétition</label><select id="competition"><option>{data.competitions[0]?.name || "Compétition à renseigner"}</option></select></div></div><nav className="tabs" aria-label="Filtrer les matchs"><Link href="/calendrier" aria-current={!results ? "page" : undefined}><Icon name="calendar" size={15} /> À venir</Link><Link href="/calendrier?onglet=resultats" aria-current={results ? "page" : undefined}><Icon name="trophy" size={15} /> Résultats</Link></nav>{list.length ? <div className="fixture-list">{list.map((match) => <MatchCard key={match.id} match={match as never} />)}</div> : <div className="empty-state panel"><strong>{results ? "Aucun résultat renseigné" : "Aucun match programmé"}</strong><span>Les informations apparaîtront ici dès qu’elles seront ajoutées par l’administration.</span></div>}</div></section></div>;
}
