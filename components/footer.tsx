import Link from "next/link";
import { ClubCrest } from "@/components/club-crest";
import { Icon } from "@/components/icons";
import { getSettings } from "@/lib/site-data";

export async function Footer() {
  const settings = await getSettings();
  return <footer className="site-footer">
    <div className="container footer-grid">
      <div className="footer-brand"><ClubCrest size="md" /><div><p className="eyebrow">Le club</p><h2>{settings.clubName}</h2><p>{settings.tagline || "Une ville. Un maillot. Une histoire à écrire."}</p></div></div>
      <div><p className="footer-label">Explorer</p><div className="footer-links"><Link href="/actualites">Actualités</Link><Link href="/calendrier">Calendrier & résultats</Link><Link href="/equipe">Effectif</Link><Link href="/club">Histoire & palmarès</Link></div></div>
      <div><p className="footer-label">Le club</p><div className="footer-links"><Link href="/partenaires">Partenaires</Link><Link href="/contact">Contact</Link><Link href="/mentions-legales">Mentions légales</Link><Link href="/confidentialite">Confidentialité</Link></div></div>
      <div><p className="footer-label">Nous trouver</p><div className="footer-contact">{settings.address && <span><Icon name="pin" size={17} />{settings.address}</span>}{settings.email && <a href={`mailto:${settings.email}`}><Icon name="mail" size={17} />{settings.email}</a>}{settings.phone && <a href={`tel:${settings.phone}`}><Icon name="phone" size={17} />{settings.phone}</a>}</div><div className="socials">{settings.instagramUrl && <a href={settings.instagramUrl} aria-label="Instagram du club" target="_blank" rel="noreferrer"><Icon name="instagram" /></a>}{settings.facebookUrl && <a href={settings.facebookUrl} aria-label="Facebook du club" target="_blank" rel="noreferrer"><Icon name="facebook" /></a>}{settings.youtubeUrl && <a href={settings.youtubeUrl} aria-label="YouTube du club" target="_blank" rel="noreferrer"><Icon name="youtube" /></a>}</div></div>
    </div>
    <div className="container footer-bottom"><span>© {new Date().getFullYear()} {settings.clubName}.</span><span>Conception et développement : <a href="https://xr-technologies-chi.vercel.app/" target="_blank" rel="noreferrer">RMWY Technologies</a></span></div>
  </footer>;
}
