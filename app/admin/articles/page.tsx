import { AdminArticleManager } from "@/components/admin-article-manager";
import { AdminShell } from "@/components/admin-shell";
import { requireSession } from "@/lib/admin";

export const dynamic = "force-dynamic";
export default async function AdminArticlesPage() { const session = await requireSession(); return <AdminShell user={session.user}><div className="admin-header"><div><p className="eyebrow">Contenus</p><h1>Articles</h1></div></div><AdminArticleManager role={session.user.role} /></AdminShell>; }
