import Link from "next/link";

export default function NotFound() { return <div className="not-found container"><p className="eyebrow">Erreur 404</p><h1>Cette page n’est pas sur la feuille de match.</h1><p>Le lien est peut-être ancien ou le contenu n’a pas encore été publié.</p><Link href="/" className="button button--dark" style={{ marginTop: 18 }}>Retour à l’accueil</Link></div>; }
