import { z } from "zod";

function isHttpUrl(value: string) {
  try {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

function isMediaUrl(value: string) {
  const isLocalPath = value.startsWith("/") && !value.startsWith("//");
  const isMediaKey = /^media\/\d{4}\/[a-f0-9-]+\.(jpe?g|png|webp|avif)$/i.test(value);
  return value === "" || isLocalPath || isMediaKey || isHttpUrl(value);
}

const optionalExternalUrl = (max = 500) => z.string().trim().max(max).refine((value) => value === "" || isHttpUrl(value), "Utilisez une URL http(s) valide.").optional().or(z.literal(""));
const optionalMediaUrl = (max = 500) => z.string().trim().max(max).refine(isMediaUrl, "Utilisez un chemin local ou une URL http(s) valide.").optional().or(z.literal(""));
const safeMediaUrl = (max = 800) => z.string().trim().max(max).refine(isMediaUrl, "Utilisez un chemin local ou une URL http(s) valide.");
const safeStorageKey = z.string().trim().regex(/^media\/\d{4}\/[a-f0-9-]+\.(jpe?g|png|webp|avif)$/i, "Clé de média invalide.");

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom.").max(80),
  email: z.string().trim().email("Indiquez une adresse email valide.").max(160),
  subject: z.string().trim().min(3, "Indiquez un objet.").max(140),
  message: z.string().trim().min(10, "Votre message est trop court.").max(4000),
  website: z.string().max(0).optional().or(z.literal(""))
});

export const articleSchema = z.object({
  title: z.string().trim().min(3).max(140),
  excerpt: z.string().trim().max(300).optional().default(""),
  content: z.string().trim().min(10).max(20000),
  category: z.string().trim().min(2).max(60),
  imageUrl: optionalMediaUrl(),
  imageAlt: z.string().trim().max(160).optional().default(""),
  status: z.enum(["DRAFT", "PUBLISHED"])
});

export const matchSchema = z.object({
  seasonId: z.string().min(1),
  competitionId: z.string().min(1),
  homeTeamId: z.string().min(1),
  awayTeamId: z.string().min(1),
  kickoffAt: z.string().datetime(),
  venue: z.string().trim().max(120).optional().default(""),
  status: z.enum(["SCHEDULED", "COMPLETED", "POSTPONED", "CANCELLED"]),
  homeScore: z.number().int().nonnegative().nullable().optional(),
  awayScore: z.number().int().nonnegative().nullable().optional(),
  report: z.string().trim().max(20000).optional().default("")
});

export const settingsSchema = z.object({
  clubName: z.string().trim().min(2).max(100),
  shortName: z.string().trim().min(2).max(12),
  tagline: z.string().trim().max(160).optional().default(""),
  description: z.string().trim().max(2000).optional().default(""),
  nickname: z.string().trim().max(80).optional().default(""),
  presidentName: z.string().trim().max(120).optional().default(""),
  presidentRole: z.string().trim().max(160).optional().default(""),
  presidentMessage: z.string().trim().max(8000).optional().default(""),
  currentCompetition: z.string().trim().max(160).optional().default(""),
  currentDivision: z.string().trim().max(120).optional().default(""),
  sportingNote: z.string().trim().max(1000).optional().default(""),
  address: z.string().trim().max(240).optional().default(""),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  phone: z.string().trim().max(50).optional().default(""),
  mapsUrl: optionalExternalUrl(),
  instagramUrl: optionalExternalUrl(),
  facebookUrl: optionalExternalUrl(),
  youtubeUrl: optionalExternalUrl(),
  logoUrl: optionalMediaUrl(),
  heroImageUrl: optionalMediaUrl(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accentColor: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  legalName: z.string().trim().max(180).optional().default(""),
  privacyText: z.string().trim().max(4000).optional().default(""),
  officialValidated: z.boolean().default(false)
});

export const referenceSchema = z.object({
  type: z.enum(["season", "competition", "team"]),
  id: z.string().optional(),
  name: z.string().trim().min(2).max(120),
  slug: z.string().trim().max(140).optional().or(z.literal("")),
  isCurrent: z.boolean().optional().default(false),
  isClub: z.boolean().optional().default(false),
  logoUrl: optionalMediaUrl()
});

export const playerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  number: z.number().int().min(0).max(99).nullable().optional(),
  position: z.enum(["GOALKEEPER", "DEFENDER", "MIDFIELDER", "FORWARD"]),
  birthDate: z.string().trim().optional().or(z.literal("")),
  bio: z.string().trim().max(3000).optional().or(z.literal("")),
  imageUrl: optionalMediaUrl(),
  imageAlt: z.string().trim().max(160).optional().or(z.literal("")),
  active: z.boolean().default(true),
  displayOrder: z.number().int().min(0).max(999).default(0),
  seasonId: z.string().optional().or(z.literal(""))
});

export const staffSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(160),
  bio: z.string().trim().max(3000).optional().or(z.literal("")),
  imageUrl: optionalMediaUrl(),
  imageAlt: z.string().trim().max(160).optional().or(z.literal("")),
  active: z.boolean().default(true),
  displayOrder: z.number().int().min(0).max(999).default(0),
  seasonId: z.string().optional().or(z.literal(""))
});

export const standingSchema = z.object({
  seasonId: z.string().min(1),
  competitionId: z.string().min(1),
  teamId: z.string().min(1),
  position: z.number().int().min(1).max(999),
  played: z.number().int().min(0).max(999),
  wins: z.number().int().min(0).max(999),
  draws: z.number().int().min(0).max(999),
  losses: z.number().int().min(0).max(999),
  goalsFor: z.number().int().min(0).max(9999),
  goalsAgainst: z.number().int().min(0).max(9999),
  points: z.number().int().min(-999).max(9999),
  pointsAdjust: z.number().int().min(-999).max(9999).default(0)
});

export const partnerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  logoUrl: optionalMediaUrl(),
  websiteUrl: optionalExternalUrl(),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  displayOrder: z.number().int().min(0).max(999).default(0),
  active: z.boolean().default(true)
});

export const historyEventSchema = z.object({
  yearLabel: z.string().trim().min(1).max(80),
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(2).max(3000),
  displayOrder: z.number().int().min(0).max(999).default(0)
});

export const trophySchema = z.object({
  yearLabel: z.string().trim().max(80).optional().or(z.literal("")),
  name: z.string().trim().min(2).max(180),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  displayOrder: z.number().int().min(0).max(999).default(0)
});

export const mediaPrepareSchema = z.object({
  action: z.literal("prepare"),
  filename: z.string().trim().min(1).max(180).refine((value) => !/[\\/]/.test(value), "Nom de fichier invalide."),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  sizeBytes: z.number().int().positive().max(8 * 1024 * 1024),
  altText: z.string().trim().min(2).max(160)
});

export const mediaCompleteSchema = z.object({
  action: z.literal("complete"),
  filename: z.string().trim().min(1).max(180).refine((value) => !/[\\/]/.test(value), "Nom de fichier invalide."),
  storageKey: safeStorageKey,
  url: safeMediaUrl(),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  sizeBytes: z.number().int().positive().max(8 * 1024 * 1024),
  altText: z.string().trim().min(2).max(160)
});

export const mediaUpdateSchema = z.object({
  id: z.string().min(1),
  altText: z.string().trim().min(2).max(160)
});

export const articleCategorySchema = z.object({
  name: z.string().trim().min(2).max(60)
});

export const adminUserCreateSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(12, "Le mot de passe doit contenir au moins 12 caractères."),
  role: z.enum(["ADMIN", "EDITOR"])
});

export const adminUserUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  password: z.string().min(12, "Le mot de passe doit contenir au moins 12 caractères.").or(z.literal("")),
  role: z.enum(["ADMIN", "EDITOR"])
});
