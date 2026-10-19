import { AdminMessageManager } from "@/components/admin-message-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireSession } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function AdminMessagesPage() { const session = await requireSession(); return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Contact</p><h1>Messages</h1></div></div><AdminMessageManager role={session.user.role} /></AdminShell>; }
