import { AdminClubContentManager } from "@/components/admin-club-content-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminClubPage() {
  const session = await requireSession();
  return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Identité & transmission</p><h1>Le club</h1></div></div><AdminClubContentManager /></AdminShell>;
}
