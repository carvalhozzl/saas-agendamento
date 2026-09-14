"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import type { Professional } from "@prisma/client";

const VIEWS = [
  { value: "dia", label: "Dia" },
  { value: "semana", label: "Semana" },
  { value: "mes", label: "Mês" },
];

export function AgendaToolbar({
  date,
  view,
  professionals,
  selectedProfessionalId,
}: {
  date: string;
  view: string;
  professionals: Professional[];
  selectedProfessionalId: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(patch: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
    router.push(`/agenda?${params.toString()}`);
  }

  function shiftDate(days: number) {
    const next = addDays(parseISO(date), days);
    updateParams({ data: format(next, "yyyy-MM-dd") });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => shiftDate(view === "mes" ? -30 : view === "semana" ? -7 : -1)}
          className="p-2 rounded-lg border border-border hover:bg-muted-surface"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <input
          type="date"
          value={date}
          onChange={(e) => updateParams({ data: e.target.value })}
          className="h-9 rounded-lg border border-border px-3 text-sm bg-surface"
        />
        <button
          onClick={() => shiftDate(view === "mes" ? 30 : view === "semana" ? 7 : 1)}
          className="p-2 rounded-lg border border-border hover:bg-muted-surface"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={selectedProfessionalId}
          onChange={(e) => updateParams({ profissional: e.target.value })}
          className="h-9 rounded-lg border border-border px-3 text-sm bg-surface"
        >
          <option value="">Todos os profissionais</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <div className="flex rounded-lg border border-border overflow-hidden">
          {VIEWS.map((v) => (
            <button
              key={v.value}
              onClick={() => updateParams({ view: v.value })}
              className={cn(
                "px-3 h-9 text-sm font-medium",
                view === v.value ? "bg-brand text-white" : "bg-surface text-foreground hover:bg-muted-surface"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
