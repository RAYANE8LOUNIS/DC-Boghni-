import { Icon } from "@/components/icons";
import { ContactForm } from "@/components/contact-form";
import { getSettings } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const settings = await getSettings();
  return <div><section className="page-intro"><div className="container page-intro__row"><div><p className="eyebrow">Écrire au club</p><h1>Contact</h1></div><p>Une question, une proposition de partenariat ou une information à transmettre ? Le club pourra vous répondre depuis son espace d’administration.</p></div></section><section className="section"><div className="container contact-grid"><div><p className="eyebrow">Coordonnées</p><h2>Parlons du prochain chapitre.</h2><div className="contact-details">{settings.address && <div className="contact-detail"><Icon name="pin" /><div><strong>Adresse</strong><span>{settings.address}</span></div></div>}{settings.email && <div className="contact-detail"><Icon name="mail" /><div><strong>Email</strong><a href={`mailto:${settings.email}`}>{settings.email}</a></div></div>}{settings.phone && <div className="contact-detail"><Icon name="phone" /><div><strong>Téléphone</strong><a href={`tel:${settings.phone}`}>{settings.phone}</a></div></div>}{settings.mapsUrl && <a className="text-link" href={settings.mapsUrl} target="_blank" rel="noreferrer">Ouvrir dans Google Maps <Icon name="external" size={15} /></a>}</div></div><ContactForm /></div></section></div>;
}
