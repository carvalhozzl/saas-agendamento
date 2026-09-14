"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const PERIODS = [
  { value: "hoje", label: "Hoje" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
];

export function PeriodFilter({ current }: { current: string }) {
  const router = useRouter();

  return (
    <div className="flex gap-2">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          onClick={() => router.push(`/relatorios?periodo=${p.value}`)}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
            current === p.value ? "bg-brand text-white border-brand" : "bg-surface text-foreground border-border hover:bg-muted-surface"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
