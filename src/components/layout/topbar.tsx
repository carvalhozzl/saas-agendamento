import Link from "next/link";
import { Plus } from "lucide-react";

export function Topbar({ userName, organizationName }: { userName: string; organizationName: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/95 backdrop-blur px-4 lg:px-8">
      <div className="lg:hidden flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-brand flex items-center justify-center text-white font-bold text-xs">
          A
        </div>
        <span className="text-sm font-semibold text-foreground truncate max-w-[10rem]">
          {organizationName}
        </span>
      </div>
      <div className="hidden lg:block">
        <p className="text-sm text-muted">
          Olá, <span className="font-medium text-foreground">{userName}</span>
        </p>
      </div>
      <Link
        href="/agendamentos?novo=1"
        className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-brand text-brand-foreground text-sm font-medium hover:bg-brand-hover transition-colors"
      >
        <Plus className="h-4 w-4" />
        Novo agendamento
      </Link>
    </header>
  );
}
