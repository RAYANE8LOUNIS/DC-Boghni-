"use client";

import { FormEvent, useEffect, useState } from "react";

type Article = { id: string; title: string; excerpt?: string | null; content: string; status: "DRAFT" | "PUBLISHED"; imageUrl?: string | null; imageAlt?: string | null; category?: { name: string } | null };
type Category = { id: string; name: string; slug: string; _count?: { articles: number } };
type ArticleForm = { title: string; excerpt: string; content: string; category: string; imageUrl: string; imageAlt: string; status: "DRAFT" | "PUBLISHED" };
const empty: ArticleForm = { title: "", excerpt: "", content: "", category: "Vie du club", imageUrl: "", imageAlt: "", status: "DRAFT" };

export function AdminArticleManager({ role }: { role?: string }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ArticleForm>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [categoryEditing, setCategoryEditing] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const [articlesResponse, categoriesResponse] = await Promise.all([fetch("/api/admin/articles"), fetch("/api/admin/article-categories")]);
    const articlesData = await articlesResponse.json();
    const categoriesData = await categoriesResponse.json();
    if (articlesResponse.ok) setArticles(articlesData.articles || []);
    if (categoriesResponse.ok) setCategories(categoriesData.categories || []);
    if (!articlesResponse.ok || !categoriesResponse.ok) setError(articlesData.message || categoriesData.message || "Chargement impossible.");
  }

  useEffect(() => { load(); }, []);

  function change(key: keyof ArticleForm, value: string) { setForm((current) => ({ ...current, [key]: key === "status" ? value as ArticleForm["status"] : value })); }
  function edit(article: Article) { setEditing(article.id); setForm({ title: article.title, excerpt: article.excerpt || "", content: article.content, category: article.category?.name || "Vie du club", imageUrl: article.imageUrl || "", imageAlt: article.imageAlt || "", status: article.status }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function resetArticle() { setEditing(null); setForm(empty); }

  async function submitArticle(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch(editing ? `/api/admin/articles/${editing}` : "/api/admin/articles", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json();
    if (!response.ok) { setError(data.message || "Impossible d’enregistrer l’article."); return; }
    setMessage(editing ? "Article mis à jour." : "Article créé.");
    resetArticle();
    load();
  }

  async function removeArticle(id: string) {
    if (!window.confirm("Supprimer définitivement cet article ?")) return;
    const response = await fetch(`/api/admin/articles/${id}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok) { setError(data.message || "Suppression impossible."); return; }
    setMessage("Article supprimé.");
    load();
  }

  function editCategory(category: Category) { setCategoryEditing(category.id); setCategoryName(category.name); }
  function resetCategory() { setCategoryEditing(null); setCategoryName(""); }

  async function submitCategory(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/article-categories", { method: categoryEditing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(categoryEditing ? { id: categoryEditing, name: categoryName } : { name: categoryName }) });
    const data = await response.json();
    if (!response.ok) { setError(data.message || "Impossible d’enregistrer la catégorie."); return; }
    setMessage(categoryEditing ? "Catégorie mise à jour." : "Catégorie créée.");
    resetCategory();
    load();
  }

  async function removeCategory(id: string) {
    if (!window.confirm("Supprimer cette catégorie ? Les articles resteront présents, sans catégorie.")) return;
    const response = await fetch("/api/admin/article-categories", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await response.json();
    if (!response.ok) { setError(data.message || "Suppression impossible."); return; }
    setMessage("Catégorie supprimée.");
    load();
  }

  return <div className="admin-manager">
    <section className="admin-card"><div className="admin-card__head"><div><p className="eyebrow">Contenus</p><h2>{editing ? "Modifier l’article" : "Écrire un article"}</h2></div>{editing && <button className="button button--outline" type="button" onClick={resetArticle}>Annuler</button>}</div><form className="admin-form" onSubmit={submitArticle}>
      <div className="field"><label htmlFor="article-title">Titre</label><input id="article-title" value={form.title} onChange={(event) => change("title", event.target.value)} required /></div>
      <div className="admin-form__row"><div className="field"><label htmlFor="article-category">Catégorie</label><input id="article-category" list="article-category-options" value={form.category} onChange={(event) => change("category", event.target.value)} required /><datalist id="article-category-options">{categories.map((category) => <option key={category.id} value={category.name} />)}</datalist></div><div className="field"><label htmlFor="article-status">Statut</label><select id="article-status" value={form.status} onChange={(event) => change("status", event.target.value)}><option value="DRAFT">Brouillon</option><option value="PUBLISHED">Publié</option></select></div></div>
      <div className="field"><label htmlFor="article-excerpt">Résumé</label><textarea id="article-excerpt" style={{ minHeight: 80 }} value={form.excerpt} onChange={(event) => change("excerpt", event.target.value)} /></div>
      <div className="field"><label htmlFor="article-content">Contenu</label><textarea id="article-content" value={form.content} onChange={(event) => change("content", event.target.value)} required /></div>
      <div className="admin-form__row"><div className="field"><label htmlFor="article-image">URL de l’image</label><input id="article-image" type="url" value={form.imageUrl} onChange={(event) => change("imageUrl", event.target.value)} placeholder="https://… ou /images/…" /></div><div className="field"><label htmlFor="article-alt">Texte alternatif</label><input id="article-alt" value={form.imageAlt} onChange={(event) => change("imageAlt", event.target.value)} /></div></div>
      {message && <div className="form-message" role="status">{message}</div>}{error && <div className="form-message form-message--error" role="alert">{error}</div>}<button className="button button--dark" type="submit">{editing ? "Enregistrer les changements" : "Créer l’article"}</button>
    </form></section>

    <section className="admin-card"><div className="admin-card__head"><div><p className="eyebrow">Bibliothèque éditoriale</p><h2>Articles récents</h2></div></div><div className="admin-list">{articles.length ? articles.map((article) => <div className="admin-list__item" key={article.id}><div><strong>{article.title}</strong><small>{article.category?.name || "Sans catégorie"} · <span className={article.status === "PUBLISHED" ? "admin-status admin-status--published" : "admin-status"}>{article.status === "PUBLISHED" ? "Publié" : "Brouillon"}</span></small></div><div className="admin-list__actions"><button type="button" onClick={() => edit(article)}>Modifier</button><button type="button" onClick={() => removeArticle(article.id)}>Supprimer</button></div></div>) : <div className="admin-empty">Aucun article en base pour le moment.</div>}</div></section>

    <section className="admin-card"><div className="admin-card__head"><div><p className="eyebrow">Organisation</p><h2>{categoryEditing ? "Modifier une catégorie" : "Catégories d’articles"}</h2></div>{categoryEditing && <button className="button button--outline" type="button" onClick={resetCategory}>Annuler</button>}</div><form className="admin-form" onSubmit={submitCategory}><div className="field"><label htmlFor="category-name">Nom de la catégorie</label><input id="category-name" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required placeholder="Ex. Vie du club" /></div><button className="button button--dark" type="submit">{categoryEditing ? "Enregistrer" : "Créer la catégorie"}</button></form><div className="admin-list">{categories.length ? categories.map((category) => <div className="admin-list__item" key={category.id}><div><strong>{category.name}</strong><small>{category._count?.articles || 0} article(s)</small></div><div className="admin-list__actions"><button type="button" onClick={() => editCategory(category)}>Modifier</button>{role === "ADMIN" && <button type="button" onClick={() => removeCategory(category.id)}>Supprimer</button>}</div></div>) : <div className="admin-empty">Aucune catégorie enregistrée.</div>}</div></section>
  </div>;
}
