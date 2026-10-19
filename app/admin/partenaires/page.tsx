import { AdminPartnerManager } from "@/components/admin-partner-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireSession } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPartnersPage() {
  const session = await requireSession();
  return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Identité du club</p><h1>Partenaires</h1></div></div><AdminPartnerManager /></AdminShell>;
}
