import { AdminMediaManager } from "@/components/admin-media-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await requireSession();
  return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Images & fichiers</p><h1>Médias</h1></div></div><AdminMediaManager role={session.user.role} /></AdminShell>;
}
