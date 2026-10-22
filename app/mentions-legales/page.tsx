import { getSettings } from "@/lib/site-data";

export const revalidate = 300;

export default async function LegalPage() {
  const settings = await getSettings();
  return <div><section className="page-intro"><div className="container"><p className="eyebrow">Informations</p><h1>Mentions légales</h1></div></section><section className="section"><div className="container legal-copy"><p>Informations légales et coordonnées du Djurdjura Club Boghni.</p><h2>Éditeur</h2><p><strong>{settings.legalName || "Djurdjura Club Boghni"}</strong><br />Adresse : {settings.address || "à renseigner"}<br />Email : {settings.email || "à renseigner"}</p><h2>Hébergement</h2><p>Hébergement du site sur l’infrastructure retenue par le club.</p><h2>Crédits</h2><p>Conception et développement : RMWY Technologies.</p></div></section></div>;
}
