import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap { const base = process.env.NEXTAUTH_URL || "http://localhost:3000"; return ["", "/actualites", "/calendrier", "/classement", "/equipe", "/club", "/partenaires", "/contact", "/mentions-legales", "/confidentialite"].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" : "monthly", priority: path === "" ? 1 : .7 })); }
