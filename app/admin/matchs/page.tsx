import { AdminMatchManager } from "@/components/admin-match-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireSession } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function AdminMatchesPage() { const session = await requireSession(); return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Données sportives</p><h1>Matchs</h1></div></div><AdminMatchManager /></AdminShell>; }
