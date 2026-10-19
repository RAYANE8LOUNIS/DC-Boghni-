import { AdminSquadManager } from "@/components/admin-squad-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminSquadPage() {
  const session = await requireSession();
  return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Équipe première</p><h1>Effectif</h1></div></div><AdminSquadManager /></AdminShell>;
}
