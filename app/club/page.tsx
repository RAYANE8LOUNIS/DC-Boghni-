import Image from "next/image";
import { Icon } from "@/components/icons";
import { getClubPageData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function ClubPage() {
  const { settings, history, trophies, staff } = await getClubPageData();
  return <div>
    <section className="page-intro"><div className="container page-intro__row"><div><p className="eyebrow">Identité & transmission</p><h1>Le club</h1></div><p>{settings.description || "Le récit du DC Boghni, ses valeurs et les personnes qui font vivre le maillot."}</p></div></section>

    <section className="section section--tight"><div className="container club-page-grid club-profile-grid">
      <div className="club-image-card"><Image src={settings.heroImageUrl || "/images/jersey-dcb.jpeg"} alt="Maillot du DC Boghni en présentation" width={1000} height={800} style={{ width: "100%", height: "100%", objectFit: "cover", filter: "grayscale(.85)" }} /></div>
      <div className="club-profile"><p className="eyebrow">Djurdjura Club Boghni</p><h2>Les Montagnards</h2><p className="club-profile__lead">Un club de football ancré à Boghni, au cœur de la Kabylie, où le maillot relie les générations, le territoire et la passion du jeu.</p><div className="club-facts"><div><span>Nom court</span><strong>{settings.shortName}</strong></div><div><span>Surnom</span><strong>{settings.nickname || "À renseigner"}</strong></div><div><span>Territoire</span><strong>Boghni · Tizi-Ouzou</strong></div></div></div>
    </div></section>

    <section className="section"><div className="container club-page-grid club-story-grid"><div><p className="eyebrow">Chronologie</p><h2>L’épopée du DCB</h2><div className="timeline">{history.map((event) => <article className="timeline__item" key={`${event.yearLabel}-${event.title}`}><span className="timeline__year">{event.yearLabel}</span><h3>{event.title}</h3><p>{event.description}</p></article>)}</div></div><aside className="president-note"><p className="president-note__label">Mot du président</p><div className="president-note__quote">“</div><blockquote>{settings.presidentMessage || "Le mot du président sera publié ici."}</blockquote><footer><strong>{settings.presidentName || "Nom à renseigner"}</strong><span>{settings.presidentRole || "Présidence du club"}</span></footer></aside></div></section>

    <section className="section section--dark"><div className="container competition-panel"><div><p className="eyebrow">Équipe fanion</p><h2>Compétition & classement</h2><p className="competition-panel__intro">Retrouvez les informations sportives de l’équipe première, son championnat et sa dynamique de saison.</p></div><div className="competition-facts"><div><span>Championnat</span><strong>{settings.currentCompetition || "À renseigner"}</strong></div><div><span>Division</span><strong>{settings.currentDivision || "À renseigner"}</strong></div></div>{settings.sportingNote && <p className="competition-panel__note">{settings.sportingNote}</p>}</div></section>

    <section className="section section--tight"><div className="container"><div className="section-heading"><div><p className="eyebrow">Organisation</p><h2>Direction & staff</h2></div><p className="section-heading__text">Les responsabilités et les personnes qui accompagnent le quotidien du club.</p></div><div className="staff-grid">{staff.map((member) => <article className="staff-card" key={member.id}><div className="staff-card__index">{String(member.displayOrder + 1).padStart(2, "0")}</div><p className="staff-card__role">{member.role}</p><h3>{member.name}</h3><p>{member.bio || "Profil à compléter."}</p></article>)}</div></div></section>

    <section className="section"><div className="container club-page-grid"><div><p className="eyebrow">Palmarès</p><h2>Les trophées</h2></div><div className="trophies">{trophies.map((trophy) => <article className="trophy-item" key={`${trophy.yearLabel}-${trophy.name}`}><Icon name="trophy" size={22} /><div><strong>{trophy.name}</strong><span>{trophy.yearLabel}{trophy.description ? ` · ${trophy.description}` : ""}</span></div></article>)}</div></div></section>
  </div>;
}
