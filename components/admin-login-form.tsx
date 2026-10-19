"use client";

import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export function AdminLoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setError(""); setLoading(true); const form = new FormData(event.currentTarget); const result = await signIn("credentials", { email: form.get("email"), password: form.get("password"), redirect: false }); if (!result?.ok) setError("Identifiants invalides ou base non configurée."); else window.location.href = "/admin"; setLoading(false); }
  return <div className="admin-login"><div className="admin-login__card"><Link href="/" className="admin-brand"><span>DCB</span><small>Retour au site</small></Link><p className="eyebrow">Espace privé</p><h1>Administration</h1><p className="admin-login__intro">Gérez les contenus du DC Boghni depuis un espace simple et sécurisé.</p><form className="contact-form" onSubmit={submit}><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required /></div><div className="field"><label htmlFor="password">Mot de passe</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>{error && <div className="form-message form-message--error" role="alert">{error}</div>}<button className="button button--dark" disabled={loading} type="submit">{loading ? "Connexion…" : "Se connecter"}</button></form><p className="form-note">Les comptes sont créés uniquement par commande sécurisée. Il n’y a pas d’inscription publique.</p></div></div>;
}
