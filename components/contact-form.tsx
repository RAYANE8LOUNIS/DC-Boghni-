"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [state, setState] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState({ type: "loading" });
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok) { setState({ type: "error", message: result.message || "Le message n’a pas pu être envoyé." }); return; }
    setState({ type: "success", message: result.message });
    event.currentTarget.reset();
  }
  return <form className="contact-form" onSubmit={submit} noValidate><div className="contact-form__row"><div className="field"><label htmlFor="name">Nom</label><input id="name" name="name" required autoComplete="name" /></div><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" required type="email" autoComplete="email" /></div></div><div className="field"><label htmlFor="subject">Objet</label><input id="subject" name="subject" required /></div><div className="field"><label htmlFor="message">Message</label><textarea id="message" name="message" required /></div><div className="honeypot" aria-hidden="true"><label htmlFor="website">Ne pas remplir</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>{state.type === "success" && <div className="form-message" role="status">{state.message}</div>}{state.type === "error" && <div className="form-message form-message--error" role="alert">{state.message}</div>}<p className="form-note">Vos données servent uniquement à traiter votre message. Aucune notification email n’est promise si le fournisseur du club n’est pas configuré.</p><button className="button button--dark" disabled={state.type === "loading"} type="submit">{state.type === "loading" ? "Envoi en cours…" : "Envoyer le message"}</button></form>;
}
