import Link from "next/link";
import { ClubCrest } from "@/components/club-crest";
import { Icon } from "@/components/icons";
import { formatDate, formatTime } from "@/lib/format";

type MatchLike = { id: string; kickoffAt: Date | string; venue?: string | null; status: string; homeScore?: number | null; awayScore?: number | null; competition?: { name: string } | null; homeTeam: { name: string; logoUrl?: string | null; isClub?: boolean }; awayTeam: { name: string; logoUrl?: string | null; isClub?: boolean } };

function TeamMark({ team, isClub }: { team: { name: string; logoUrl?: string | null; isClub?: boolean }; isClub?: boolean }) {
  return isClub || team.isClub ? <ClubCrest size="md" /> : <div className="team-placeholder" aria-hidden="true">{team.name.slice(0, 2).toUpperCase()}</div>;
}

export function MatchCard({ match, compact = false }: { match: MatchLike; compact?: boolean }) {
  const completed = match.status === "COMPLETED";
  return <article className={`match-card ${compact ? "match-card--compact" : ""}`}>
    <div className="match-card__meta"><span>{match.competition?.name || "Compétition à renseigner"}</span><span>{formatDate(match.kickoffAt)} · {formatTime(match.kickoffAt)}</span></div>
    <div className="match-card__teams"><div className="match-team"><TeamMark team={match.homeTeam} isClub={match.homeTeam.isClub} /><strong>{match.homeTeam.name}</strong><small>Domicile</small></div><div className={`match-score ${completed ? "match-score--done" : ""}`}>{completed ? <><b>{match.homeScore ?? "–"}</b><i>—</i><b>{match.awayScore ?? "–"}</b></> : <span>VS</span>}</div><div className="match-team"><TeamMark team={match.awayTeam} isClub={match.awayTeam.isClub} /><strong>{match.awayTeam.name}</strong><small>Extérieur</small></div></div>
    <div className="match-card__footer"><span><Icon name="pin" size={15} />{match.venue || "Stade à renseigner"}</span>{match.id && match.id !== "demo" && <Link href={`/calendrier/${match.id}`} className="text-link">Détails <Icon name="arrow" size={15} /></Link>}</div>
  </article>;
}
