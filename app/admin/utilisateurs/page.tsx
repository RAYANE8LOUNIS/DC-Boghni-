import { AdminShell } from "@/components/admin-shell";
import { AdminUserManager } from "@/components/admin-user-manager";
import { requireSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await requireSession();
  if (session.user.role !== "ADMIN") {
    return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Accès privé</p><h1>Comptes</h1></div></div><section className="admin-card"><div className="form-message form-message--error" style={{ margin: 24 }}>Cette page est réservée aux administrateurs.</div></section></AdminShell>;
  }
  return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Accès privé</p><h1>Comptes</h1></div></div><AdminUserManager currentUserId={session.user.id} /></AdminShell>;
}
