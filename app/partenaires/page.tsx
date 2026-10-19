import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { getPartners } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await getPartners();
  return <div><section className="page-intro"><div className="container page-intro__row"><div><p className="eyebrow">Autour du maillot</p><h1>Partenaires</h1></div><p>Un espace clair pour présenter les soutiens du club, leur activité et le lien vers leur univers.</p></div></section><section className="section"><div className="container">{partners.length ? <div className="news-list">{partners.map((partner) => <article className="panel" style={{ padding: 24 }} key={partner.id}>{partner.logoUrl && <Image src={partner.logoUrl} alt={`Logo ${partner.name}`} width={160} height={80} style={{ objectFit: "contain", objectPosition: "left", marginBottom: 20 }} />}<p className="eyebrow">Partenaire</p><h3 style={{ fontFamily: "Inter", fontSize: 20, fontWeight: 800, letterSpacing: 0 }}>{partner.name}</h3>{partner.description && <p style={{ color: "#444", fontSize: 14 }}>{partner.description}</p>}{partner.websiteUrl && <a className="text-link" href={partner.websiteUrl} target="_blank" rel="noreferrer">Visiter le site <Icon name="external" size={15} /></a>}</article>)}</div> : <div className="empty-state panel"><strong>Les partenaires arrivent bientôt</strong><span>Le club pourra présenter ici ses partenaires dès qu’ils seront renseignés.</span></div>}<div className="partner-cta"><p className="eyebrow">Devenir partenaire</p><h2>Soutenir le club, simplement.</h2><p>Vous souhaitez associer votre activité au DC Boghni ? Écrivez-nous pour recevoir les informations utiles.</p><Link className="button button--dark" href="/contact">Contacter le club <Icon name="arrow" size={16} /></Link></div></div></section></div>;
}
