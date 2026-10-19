"use client";

import { useEffect, useState } from "react";

type Message = { id: string; name: string; email: string; subject: string; message: string; status: "UNREAD" | "READ" | "ARCHIVED"; createdAt: string };
const statusLabels = { UNREAD: "Non lu", READ: "Lu", ARCHIVED: "Archivé" };

export function AdminMessageManager({ role }: { role?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/admin/messages");
    const data = await response.json();
    if (response.ok) setMessages(data.messages || []);
    else setError(data.message || "Chargement impossible.");
  }

  useEffect(() => { load(); }, []);

  async function update(id: string, status: Message["status"]) {
    const response = await fetch("/api/admin/messages", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (!response.ok) { const data = await response.json(); setError(data.message || "Action impossible."); return; }
    load();
  }

  async function remove(id: string) {
    if (!window.confirm("Supprimer définitivement ce message ?")) return;
    const response = await fetch("/api/admin/messages", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (!response.ok) { const data = await response.json(); setError(data.message || "Suppression impossible."); return; }
    load();
  }

  return <section className="admin-card"><div className="admin-card__head"><div><p className="eyebrow">Boîte de réception</p><h2>Messages reçus</h2></div></div>{error && <div className="form-message form-message--error" role="alert">{error}</div>}<div className="admin-list">{messages.length ? messages.map((item) => <article className="admin-message" key={item.id}><div className="admin-message__top"><div><strong>{item.subject}</strong><small>{item.name} · <a href={`mailto:${item.email}`}>{item.email}</a> · {new Date(item.createdAt).toLocaleString("fr-FR")}</small></div><span className={`admin-status ${item.status === "UNREAD" ? "admin-status--unread" : ""}`}>{statusLabels[item.status]}</span></div><p>{item.message}</p><div className="admin-list__actions">{item.status !== "UNREAD" && <button type="button" onClick={() => update(item.id, "UNREAD")}>Rendre non lu</button>}{item.status !== "READ" && <button type="button" onClick={() => update(item.id, "READ")}>Marquer lu</button>}{item.status !== "ARCHIVED" && <button type="button" onClick={() => update(item.id, "ARCHIVED")}>Archiver</button>}{role === "ADMIN" && <button type="button" onClick={() => remove(item.id)}>Supprimer</button>}</div></article>) : <div className="admin-empty">Aucun message dans la base.</div>}</div></section>;
}
