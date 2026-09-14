"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { WEEKDAY_LABELS } from "@/lib/segments";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { saveWorkingHoursAction } from "@/app/(app)/horarios/actions";

type Day = {
  weekday: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
  breakStart?: string | null;
  breakEnd?: string | null;
};

export function WorkingHoursEditor({
  professionalId,
  initialDays,
}: {
  professionalId: string | null;
  initialDays: Day[];
}) {
  const [days, setDays] = useState<Day[]>(initialDays);
  const [isPending, startTransition] = useTransition();

  function update(index: number, patch: Partial<Day>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function save() {
    startTransition(async () => {
      try {
        await saveWorkingHoursAction(
          professionalId,
          days.map((d) => ({
            weekday: d.weekday,
            enabled: d.enabled,
            startTime: d.startTime,
            endTime: d.endTime,
            breakStart: d.breakStart || "",
            breakEnd: d.breakEnd || "",
          }))
        );
        toast.success("Horários salvos com sucesso.");
      } catch {
        toast.error("Não foi possível salvar os horários.");
      }
    });
  }

  return (
    <div className="space-y-3">
      {days.map((day, i) => (
        <div key={day.weekday} className="flex flex-wrap items-center gap-3 py-2 border-b border-border last:border-0">
          <label className="flex items-center gap-2 w-32 shrink-0 text-sm font-medium text-foreground">
            <input type="checkbox" checked={day.enabled} onChange={(e) => update(i, { enabled: e.target.checked })} />
            {WEEKDAY_LABELS[day.weekday]}
          </label>
          {day.enabled ? (
            <>
              <Input type="time" value={day.startTime} onChange={(e) => update(i, { startTime: e.target.value })} className="h-9 w-28" />
              <span className="text-sm text-muted">até</span>
              <Input type="time" value={day.endTime} onChange={(e) => update(i, { endTime: e.target.value })} className="h-9 w-28" />
              <span className="text-sm text-muted ml-2">Intervalo:</span>
              <Input
                type="time"
                value={day.breakStart ?? ""}
                onChange={(e) => update(i, { breakStart: e.target.value })}
                className="h-9 w-28"
              />
              <span className="text-sm text-muted">até</span>
              <Input
                type="time"
                value={day.breakEnd ?? ""}
                onChange={(e) => update(i, { breakEnd: e.target.value })}
                className="h-9 w-28"
              />
            </>
          ) : (
            <span className="text-sm text-muted">Fechado</span>
          )}
        </div>
      ))}
      <div className="pt-2">
        <Button onClick={save} isLoading={isPending}>
          Salvar horários
        </Button>
      </div>
    </div>
  );
}
