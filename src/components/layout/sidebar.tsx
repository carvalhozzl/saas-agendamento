"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { NAV_ITEMS } from "./nav-items";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/(app)/actions";

export function Sidebar({ organizationName }: { organizationName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r border-border bg-surface h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2 px-5 border-b border-border">
        <div className="h-8 w-8 rounded-lg bg-brand flex items-center justify-center text-white font-bold text-sm">
          A
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{organizationName}</p>
          <p className="text-xs text-muted">AgendaPro</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-muted hover:bg-muted-surface hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <form action={logoutAction} className="p-3 border-t border-border">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-muted-surface hover:text-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" strokeWidth={2} />
          Sair
        </button>
      </form>
    </aside>
  );
}
