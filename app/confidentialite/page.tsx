import { getSettings } from "@/lib/site-data";

export const revalidate = 300;

export default async function PrivacyPage() {
  const settings = await getSettings();
  return <div><section className="page-intro"><div className="container"><p className="eyebrow">Données personnelles</p><h1>Confidentialité</h1></div></section><section className="section"><div className="container legal-copy"><p>{settings.privacyText || "Le club doit compléter cette page avec sa politique de confidentialité validée. Le formulaire de contact enregistre uniquement les informations nécessaires au traitement d’une demande et l’administration peut les marquer comme lues ou archivées."}</p><h2>Données du formulaire de contact</h2><p>Nom, email, objet et message sont conservés dans l’espace privé du club pour assurer le suivi des demandes. Une notification email n’est envoyée que si un fournisseur est configuré.</p><h2>Vos droits</h2><p>Ajoutez ici la procédure de contact du responsable du traitement pour les demandes d’accès, de rectification ou de suppression.</p></div></section></div>;
}
