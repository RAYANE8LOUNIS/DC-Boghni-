import Image from "next/image";
import Link from "next/link";
import { ClubCrest } from "@/components/club-crest";
import { Icon } from "@/components/icons";
import { MatchCard } from "@/components/match-card";
import { NewsCard } from "@/components/news-card";
import { SectionHeading } from "@/components/section-heading";
import { formatDate, formatTime } from "@/lib/format";
import { getHomeData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, articles, upcoming, latestResult, standings, players } = await getHomeData();
  return <>
    <section className="hero">
      <div className="hero__media"><Image src={settings.heroImageUrl || "/images/jersey-dcb.jpeg"} alt="Maillot du DC Boghni — visuel de présentation" fill priority sizes="100vw" /></div>
      <div className="container hero__content">
        <div className="hero__copy">
          <div className="hero__topline"><span className="hero__topline-rule" /> <span>D.C.B. / CLUB DE FOOTBALL</span></div>
          <h1>Le football<br /><span>commence ici.</span></h1>
          <p className="hero__lede">{settings.tagline || "Une ville. Un maillot. Une histoire à écrire."}</p>
          <div className="hero__bottom"><div className="button-row"><Link className="button button--primary" href="/calendrier">Voir les matchs <Icon name="arrow" size={17} /></Link><Link className="button button--outline" href="/equipe">Découvrir l’effectif</Link></div><span className="hero__stamp">DCB · BOGHNI · KABYLIE</span></div>
        </div>
        <div className="hero__visual-note" aria-hidden="true">
          <div className="hero__crest-frame"><ClubCrest size="lg" src={settings.logoUrl || "/images/logo-dcb.jpeg"} /></div>
          <div className="hero__vertical-label">Boghni · Kabylie</div>
        </div>
      </div>
      <div className="hero__footer container" aria-hidden="true"><span>Une identité en mouvement</span><span>Actualités · matchs · effectif</span></div>
    </section>
    <section className="section section--tight"><div className="container home-grid">
      <div className="panel"><div className="panel__top"><p className="panel__title">Prochain rendez-vous</p><Icon name="calendar" size={18} /></div>{upcoming ? <MatchCard match={upcoming as never} compact /> : <div className="empty-state"><strong>Calendrier à renseigner</strong><span>Aucun match n’est programmé pour le moment.</span></div>}</div>
      <div className="panel panel--dark"><div className="panel__top"><p className="panel__title">Dernier résultat</p><Icon name="trophy" size={18} /></div>{latestResult ? <MatchCard match={latestResult as never} compact /> : <div className="empty-state"><strong style={{ color: "#fff" }}>Résultat à renseigner</strong><span>Aucun score n’est affiché ici.</span></div>}</div>
    </div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="Le fil du club" title="Actualités" text="Les histoires, les annonces et les rendez-vous qui donnent vie au maillot." href="/actualites" /><div className="news-grid">{articles.map((article, index) => <NewsCard key={article.id} article={article as never} featured={index === 0} />)}</div></div></section>
    <section className="section section--dark"><div className="container"><SectionHeading eyebrow="La saison" title="Le classement" text="Les données sont saisies manuellement par l’administration du club." href="/classement" linkLabel="Voir le classement" light /><div className="dark-table"><table className="standings"><thead><tr><th>#</th><th>Équipe</th><th>MJ</th><th>V</th><th>N</th><th>D</th><th>Pts</th></tr></thead><tbody>{standings.map((row) => <tr className={row.isClub ? "club-row" : ""} key={`${row.position}-${row.team}`}> <td><span className="standing-rank">{row.position}</span></td><td>{row.team}</td><td>{row.played}</td><td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td><td><strong>{row.points}</strong></td></tr>)}</tbody></table></div></div></section>
    <section className="section"><div className="container"><SectionHeading eyebrow="Les visages" title="L’effectif" text="Les profils du DCB, organisés par saison, poste et numéro." href="/equipe" linkLabel="Voir tout l’effectif" /><div className="mini-players">{players.map((player) => <Link href={`/equipe/${player.slug}`} className="player-tile" key={player.id}><div className="player-tile__image"><Image src={player.imageUrl || "/images/logo-dcb.jpeg"} alt={player.imageAlt || `Portrait de ${player.name}`} fill sizes="(max-width: 600px) 50vw, 25vw" /><span className="player-tile__number">{player.number ?? "—"}</span></div><div className="player-tile__body"><small>{String(player.position).replace("GOALKEEPER", "Gardien").replace("DEFENDER", "Défenseur").replace("MIDFIELDER", "Milieu").replace("FORWARD", "Attaquant")}</small><strong>{player.name}</strong></div></Link>)}</div></div></section>
    <section className="section section--tight"><div className="container club-strip"><div><p className="eyebrow">Le club</p><h2>Une identité ancrée dans le territoire.</h2></div><div><p className="club-strip__text">Le DC Boghni rassemble une histoire, un maillot, des équipes et une communauté au cœur de la Kabylie.</p><p className="club-strip__note">Retrouvez l’histoire, les valeurs, le palmarès et les visages qui font vivre le club.</p><Link className="text-link" href="/club">Découvrir le club <Icon name="arrow" size={16} /></Link></div></div></section>
  </>;
}
