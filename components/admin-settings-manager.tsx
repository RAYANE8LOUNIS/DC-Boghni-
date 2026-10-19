"use client";

import { FormEvent, useEffect, useState } from "react";

type SettingsForm = {
  clubName: string;
  shortName: string;
  tagline: string;
  description: string;
  nickname: string;
  presidentName: string;
  presidentRole: string;
  presidentMessage: string;
  currentCompetition: string;
  currentDivision: string;
  sportingNote: string;
  address: string;
  email: string;
  phone: string;
  mapsUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  logoUrl: string;
  heroImageUrl: string;
  primaryColor: string;
  accentColor: string;
  legalName: string;
  privacyText: string;
  officialValidated: boolean;
};

const empty: SettingsForm = {
  clubName: "DC Boghni", shortName: "DCB", tagline: "", description: "", nickname: "",
  presidentName: "", presidentRole: "", presidentMessage: "", currentCompetition: "", currentDivision: "", sportingNote: "",
  address: "", email: "", phone: "", mapsUrl: "", instagramUrl: "", facebookUrl: "", youtubeUrl: "",
  logoUrl: "/images/logo-dcb.jpeg", heroImageUrl: "/images/jersey-dcb.jpeg", primaryColor: "#101114", accentColor: "#202124",
  legalName: "", privacyText: "", officialValidated: true
};

export function AdminSettingsManager({ role }: { role?: string }) {
  const [form, setForm] = useState<SettingsForm>(empty);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings").then((response) => response.json()).then((data) => {
      if (data.settings) setForm({ ...empty, ...data.settings, officialValidated: true });
    });
  }, []);

  function change(key: keyof SettingsForm, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, officialValidated: true }) });
    const data = await response.json();
    if (!response.ok) { setError(data.message || "Impossible d’enregistrer les paramètres."); return; }
    setForm({ ...empty, ...data.settings, officialValidated: true });
    setMessage("Paramètres enregistrés.");
  }

  if (role !== "ADMIN") return <section className="admin-card"><div className="form-message form-message--error" style={{ margin: 24 }}>Seuls les administrateurs peuvent modifier l’identité du club et les paramètres sensibles.</div></section>;

  return <section className="admin-card"><div className="admin-card__head"><div><p className="eyebrow">Identité du club</p><h2>Paramètres publics</h2></div></div><form className="admin-form" onSubmit={submit}>
    <div className="admin-form__row"><div className="field"><label htmlFor="settings-name">Nom du club</label><input id="settings-name" value={form.clubName} onChange={(event) => change("clubName", event.target.value)} required /></div><div className="field"><label htmlFor="settings-short">Nom court</label><input id="settings-short" value={form.shortName} onChange={(event) => change("shortName", event.target.value)} required /></div></div>
    <div className="admin-form__row"><div className="field"><label htmlFor="settings-nickname">Surnom du club</label><input id="settings-nickname" value={form.nickname} onChange={(event) => change("nickname", event.target.value)} placeholder="Ex. Les Montagnards" /></div><div className="field"><label htmlFor="settings-tagline">Slogan</label><input id="settings-tagline" value={form.tagline} onChange={(event) => change("tagline", event.target.value)} /></div></div>
    <div className="field"><label htmlFor="settings-description">Présentation</label><textarea id="settings-description" value={form.description} onChange={(event) => change("description", event.target.value)} /></div>
    <div className="admin-settings-subhead"><p className="eyebrow">Direction</p><h3>Mot du président</h3></div>
    <div className="admin-form__row"><div className="field"><label htmlFor="settings-president-name">Nom du président</label><input id="settings-president-name" value={form.presidentName} onChange={(event) => change("presidentName", event.target.value)} /></div><div className="field"><label htmlFor="settings-president-role">Fonction</label><input id="settings-president-role" value={form.presidentRole} onChange={(event) => change("presidentRole", event.target.value)} /></div></div>
    <div className="field"><label htmlFor="settings-president-message">Message</label><textarea id="settings-president-message" value={form.presidentMessage} onChange={(event) => change("presidentMessage", event.target.value)} /></div>
    <div className="admin-settings-subhead"><p className="eyebrow">Équipe fanion</p><h3>Compétition</h3></div>
    <div className="admin-form__row"><div className="field"><label htmlFor="settings-competition">Championnat</label><input id="settings-competition" value={form.currentCompetition} onChange={(event) => change("currentCompetition", event.target.value)} /></div><div className="field"><label htmlFor="settings-division">Division</label><input id="settings-division" value={form.currentDivision} onChange={(event) => change("currentDivision", event.target.value)} /></div></div>
    <div className="field"><label htmlFor="settings-sporting-note">Note sportive</label><textarea id="settings-sporting-note" value={form.sportingNote} onChange={(event) => change("sportingNote", event.target.value)} /></div>
    <div className="admin-form__row"><div className="field"><label htmlFor="settings-address">Adresse</label><input id="settings-address" value={form.address} onChange={(event) => change("address", event.target.value)} /></div><div className="field"><label htmlFor="settings-email">Email</label><input id="settings-email" type="email" value={form.email} onChange={(event) => change("email", event.target.value)} /></div></div>
    <div className="admin-form__row"><div className="field"><label htmlFor="settings-phone">Téléphone</label><input id="settings-phone" value={form.phone} onChange={(event) => change("phone", event.target.value)} /></div><div className="field"><label htmlFor="settings-maps">Lien Google Maps</label><input id="settings-maps" type="url" value={form.mapsUrl} onChange={(event) => change("mapsUrl", event.target.value)} /></div></div>
    <div className="admin-form__row"><div className="field"><label htmlFor="settings-logo">URL du logo</label><input id="settings-logo" value={form.logoUrl} onChange={(event) => change("logoUrl", event.target.value)} /></div><div className="field"><label htmlFor="settings-hero">URL du visuel d’accueil</label><input id="settings-hero" value={form.heroImageUrl} onChange={(event) => change("heroImageUrl", event.target.value)} /></div></div>
    <div className="admin-form__row"><div className="field"><label htmlFor="settings-primary">Couleur principale</label><input id="settings-primary" type="text" pattern="#[0-9a-fA-F]{6}" value={form.primaryColor} onChange={(event) => change("primaryColor", event.target.value)} /></div><div className="field"><label htmlFor="settings-accent">Couleur accent</label><input id="settings-accent" type="text" pattern="#[0-9a-fA-F]{6}" value={form.accentColor} onChange={(event) => change("accentColor", event.target.value)} /></div></div>
    <div className="field"><label htmlFor="settings-legal">Nom légal</label><input id="settings-legal" value={form.legalName} onChange={(event) => change("legalName", event.target.value)} /></div>
    <div className="field"><label htmlFor="settings-privacy">Texte de confidentialité</label><textarea id="settings-privacy" value={form.privacyText} onChange={(event) => change("privacyText", event.target.value)} /></div>
    {message && <div className="form-message" role="status">{message}</div>}{error && <div className="form-message form-message--error" role="alert">{error}</div>}<button className="button button--dark" type="submit">Enregistrer les paramètres</button>
  </form></section>;
}
