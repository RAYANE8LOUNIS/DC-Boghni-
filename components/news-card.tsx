import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";

export function NewsCard({ article, featured = false }: { article: { title: string; slug: string; excerpt?: string | null; imageUrl?: string | null; imageAlt?: string | null; category?: string | { name: string } | null; date?: Date | string | null; }; featured?: boolean }) {
  const category = typeof article.category === "string" ? article.category : article.category?.name || "Actualité";
  return <article className={`news-card ${featured ? "news-card--featured" : ""}`}><Link href={`/actualites/${article.slug}`} className="news-card__image">{article.imageUrl ? <Image src={article.imageUrl} alt={article.imageAlt || article.title} fill sizes={featured ? "(max-width: 900px) 100vw, 55vw" : "(max-width: 900px) 100vw, 33vw"} /> : <div className="image-placeholder">DCB</div>}<span>{category}</span></Link><div className="news-card__body"><p className="news-date">{article.date ? new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(article.date)) : "Date à renseigner"}</p><h3><Link href={`/actualites/${article.slug}`}>{article.title}</Link></h3>{article.excerpt && <p>{article.excerpt}</p>}<Link className="text-link" href={`/actualites/${article.slug}`}>Lire l’article <Icon name="arrow" size={16} /></Link></div></article>;
}
