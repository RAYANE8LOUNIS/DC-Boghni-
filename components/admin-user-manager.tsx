"use client";

import { FormEvent, useEffect, useState } from "react";

type AdminUser = { id: string; name: string | null; email: string; role: "ADMIN" | "EDITOR"; createdAt: string };
type FormState = { name: string; email: string; password: string; role: "ADMIN" | "EDITOR" };
const empty: FormState = { name: "", email: "", password: "", role: "EDITOR" };

export function AdminUserManager({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [form, setForm] = useState<FormState>(empty);
  const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/users");
    const data = await response.json();
    if (response.ok) setUsers(data.users || []);
    else setError(data.message || "Chargement impossible.");
  }

  useEffect(() => { load(); }, []);

  function change(key: keyof FormState, value: string) { setForm((current) => ({ ...current, [key]: value })); }
  function edit(user: AdminUser) { setEditing(user.id); setForm({ name: user.name || "", email: user.email, password: "", role: user.role }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function reset() { setEditing(null); setForm(empty); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!editing && form.password.length < 12) { setError("Le mot de passe doit contenir au moins 12 caractères."); return; }
    if (editing && form.password && form.password.length < 12) { setError("Le nouveau mot de passe doit contenir au moins 12 caractères."); return; }
    const response = await fetch("/api/admin/users", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing ? { ...form, id: editing } : form) });
    const data = await response.json();
    if (!response.ok) { setError(data.message || "Impossible d’enregistrer ce compte."); return; }
    setMessage(editing ? "Compte mis à jour." : "Compte créé.");
    reset();
    load();
  }

  async function remove(id: string) {
    if (id === currentUserId) { setError("Vous ne pouvez pas supprimer votre propre compte."); return; }
    if (!window.confirm("Supprimer définitivement ce compte ?")) return;
    const response = await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    const data = await response.json();
    if (!response.ok) { setError(data.message || "Suppression impossible."); return; }
    setMessage("Compte supprimé.");
    load();
  }

  return <div className="admin-manager"><section className="admin-card"><div className="admin-card__head"><div><p className="eyebrow">Accès privé</p><h2>{editing ? "Modifier un compte" : "Ajouter un compte"}</h2></div>{editing && <button className="button button--outline" type="button" onClick={reset}>Annuler</button>}</div><form className="admin-form" onSubmit={submit}><div className="admin-form__row"><div className="field"><label htmlFor="admin-user-name">Nom</label><input id="admin-user-name" value={form.name} onChange={(event) => change("name", event.target.value)} required /></div><div className="field"><label htmlFor="admin-user-email">Email</label><input id="admin-user-email" type="email" value={form.email} onChange={(event) => change("email", event.target.value)} required /></div></div><div className="admin-form__row"><div className="field"><label htmlFor="admin-user-password">{editing ? "Nouveau mot de passe (facultatif)" : "Mot de passe"}</label><input id="admin-user-password" type="password" minLength={12} value={form.password} onChange={(event) => change("password", event.target.value)} required={!editing} autoComplete="new-password" /><small className="form-note">12 caractères minimum. Ne partagez jamais ce mot de passe.</small></div><div className="field"><label htmlFor="admin-user-role">Rôle</label><select id="admin-user-role" value={form.role} onChange={(event) => change("role", event.target.value as FormState["role"])}><option value="EDITOR">Éditeur · contenus</option><option value="ADMIN">Administrateur · accès complet</option></select></div></div>{message && <div className="form-message" role="status">{message}</div>}{error && <div className="form-message form-message--error" role="alert">{error}</div>}<button className="button button--dark" type="submit">{editing ? "Enregistrer les changements" : "Créer le compte"}</button></form></section><section className="admin-card"><div className="admin-card__head"><div><p className="eyebrow">Comptes autorisés</p><h2>Administrateurs et éditeurs</h2></div></div><div className="admin-list">{users.length ? users.map((user) => <div className="admin-list__item" key={user.id}><div><strong>{user.name || user.email}</strong><small>{user.email} · {user.role === "ADMIN" ? "Administrateur" : "Éditeur"}</small></div><div className="admin-list__actions"><button type="button" onClick={() => edit(user)}>Modifier</button>{user.id === currentUserId ? <small>Compte actuel</small> : <button type="button" onClick={() => remove(user.id)}>Supprimer</button>}</div></div>) : <div className="admin-empty">Aucun compte disponible.</div>}</div></section></div>;
}
