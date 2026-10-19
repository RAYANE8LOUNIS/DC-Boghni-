import Link from "next/link";
import { NewsCard } from "@/components/news-card";
import { Icon } from "@/components/icons";
import { getPublishedArticles } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ q?: string; categorie?: string }> }) {
  const params = await searchParams;
  const { articles, categories } = await getPublishedArticles({ search: params.q, category: params.categorie });
  return <div><section className="page-intro"><div className="container page-intro__row"><div><p className="eyebrow">Le fil du club</p><h1>Actualités</h1></div><p>Les annonces, les récits et les jours de match du DC Boghni.</p></div></section><section className="section"><div className="container"><form className="filters" role="search"><div className="field"><label htmlFor="q">Rechercher</label><input id="q" name="q" defaultValue={params.q} placeholder="Titre de l’article" /></div><div className="field"><label htmlFor="categorie">Catégorie</label><select id="categorie" name="categorie" defaultValue={params.categorie || ""}><option value="">Toutes les catégories</option>{categories.map((category) => <option key={typeof category === "string" ? category : category.slug} value={typeof category === "string" ? category : category.slug}>{typeof category === "string" ? category : category.name}</option>)}</select></div><button className="button button--dark" type="submit"><Icon name="search" size={16} />Rechercher</button></form>{articles.length ? <div className="news-list">{articles.map((article) => <NewsCard key={article.id} article={article as never} />)}</div> : <div className="empty-state panel"><strong>Aucun article trouvé</strong><span>Essayez un autre mot-clé ou retirez le filtre.</span><Link href="/actualites" className="text-link" style={{ margin: "18px auto 0" }}>Réinitialiser <Icon name="arrow" size={15} /></Link></div>}</div></section></div>;
}
