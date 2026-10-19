import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyLinkButton } from "@/components/copy-link-button";
import { getArticleBySlug, getPublishedArticles } from "@/lib/site-data";
import { formatDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  const { articles } = await getPublishedArticles({ category: article.category || undefined });
  const related = articles.filter((item) => item.slug !== article.slug).slice(0, 2);
  const category = article.category || "Actualité";
  return <div><section className="article-hero"><div className="container article-hero__inner"><p className="article-kicker">{category} · {formatDate(article.publishedAt || article.date || new Date())}</p><h1>{article.title}</h1><p className="article-excerpt">{article.excerpt}</p></div></section><section className="article-layout container"><article className="article-layout__main">{article.imageUrl && <Image src={article.imageUrl} alt={article.imageAlt || article.title} width={1200} height={720} priority />}<div className="article-content">{article.content.split("\n\n").map((paragraph: string, index: number) => <p key={index}>{paragraph}</p>)}</div></article><aside className="article-share"><p>Partager</p><CopyLinkButton /><Link href="/actualites" className="text-link" style={{ marginTop: 20 }}>Toutes les actualités</Link></aside></section>{related.length > 0 && <section className="section section--tight"><div className="container"><p className="eyebrow">À lire ensuite</p><div className="news-grid">{related.map((item) => <div key={item.id} className="news-card"><Link href={`/actualites/${item.slug}`} className="text-link">{item.title}</Link></div>)}</div></div></section>}</div>;
}
