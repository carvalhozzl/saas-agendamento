"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Professional } from "@prisma/client";

export function HorariosScopeTabs({ professionals, selected }: { professionals: Professional[]; selected: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      <button
        onClick={() => router.push("/horarios")}
        className={cn(
          "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors",
          !selected ? "bg-brand text-white border-brand" : "bg-surface text-foreground border-border hover:bg-muted-surface"
        )}
      >
        Padrão da empresa
      </button>
      {professionals.map((p) => (
        <button
          key={p.id}
          onClick={() => router.push(`/horarios?profissional=${p.id}`)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors",
            selected === p.id ? "bg-brand text-white border-brand" : "bg-surface text-foreground border-border hover:bg-muted-surface"
          )}
        >
          {p.name}
        </button>
      ))}
    </div>
  );
}
