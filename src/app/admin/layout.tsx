import Link from "next/link";
import { requireSuperAdmin } from "@/lib/auth/context";
import { LayoutDashboard, Building2, LogOut } from "lucide-react";
import { logoutAction } from "@/app/(app)/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSuperAdmin();

  return (
    <div className="min-h-screen flex">
      <aside className="w-60 shrink-0 border-r border-border bg-surface min-h-screen">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
          <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">
            A
          </div>
          <span className="font-semibold text-foreground">Admin AgendaPro</span>
        </div>
        <nav className="p-3 space-y-0.5">
          <Link href="/admin" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted-surface hover:text-foreground">
            <LayoutDashboard className="h-5 w-5" /> Visão geral
          </Link>
          <Link href="/admin/empresas" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted-surface hover:text-foreground">
            <Building2 className="h-5 w-5" /> Empresas
          </Link>
        </nav>
        <form action={logoutAction} className="p-3 border-t border-border mt-auto">
          <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted-surface hover:text-foreground">
            <LogOut className="h-5 w-5" /> Sair
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
