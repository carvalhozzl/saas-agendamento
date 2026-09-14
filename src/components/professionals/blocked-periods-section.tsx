"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Trash2, CalendarOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { blockedPeriodSchema, type BlockedPeriodInput } from "@/lib/validations/professional";
import { createBlockedPeriodAction, deleteBlockedPeriodAction } from "@/app/(app)/horarios/actions";
import type { BlockedPeriod, Professional } from "@prisma/client";

const REASON_LABELS: Record<string, string> = {
  MEETING: "Reunião",
  DAY_OFF: "Folga",
  MAINTENANCE: "Manutenção",
  VACATION: "Férias",
  HOLIDAY: "Feriado",
  OTHER: "Outro",
};

export function BlockedPeriodsSection({
  blockedPeriods,
  professionals,
}: {
  blockedPeriods: (BlockedPeriod & { professional: Professional | null })[];
  professionals: Professional[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BlockedPeriodInput>({
    resolver: zodResolver(blockedPeriodSchema) as Resolver<BlockedPeriodInput>,
    defaultValues: { reason: "OTHER", professionalId: "" },
  });

  function onSubmit(data: BlockedPeriodInput) {
    startTransition(async () => {
      try {
        await createBlockedPeriodAction(data);
        toast.success("Bloqueio criado.");
        setModalOpen(false);
        reset();
      } catch {
        toast.error("Não foi possível criar o bloqueio.");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Remover este bloqueio?")) return;
    startTransition(async () => {
      await deleteBlockedPeriodAction(id);
    });
  }

  return (
    <Card>
      <div className="flex items-center justify-between p-5 border-b border-border">
        <div>
          <h2 className="text-base font-semibold text-foreground">Bloqueios de horário</h2>
          <p className="text-sm text-muted mt-0.5">Reuniões, folgas, férias ou manutenções.</p>
        </div>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Novo bloqueio
        </Button>
      </div>

      {blockedPeriods.length === 0 ? (
        <EmptyState icon={CalendarOff} title="Nenhum bloqueio cadastrado." />
      ) : (
        <ul className="divide-y divide-border">
          {blockedPeriods.map((b) => (
            <li key={b.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {REASON_LABELS[b.reason]} {b.professional ? `· ${b.professional.name}` : "· Toda a empresa"}
                </p>
                <p className="text-xs text-muted">
                  {format(b.startsAt, "dd/MM/yyyy HH:mm")} até {format(b.endsAt, "dd/MM/yyyy HH:mm")}
                  {b.note ? ` · ${b.note}` : ""}
                </p>
              </div>
              <button
                onClick={() => handleDelete(b.id)}
                disabled={isPending}
                className="p-2 rounded-lg text-muted hover:bg-danger-bg hover:text-danger"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo bloqueio">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="professionalId">Profissional</Label>
            <Select id="professionalId" {...register("professionalId")}>
              <option value="">Toda a empresa</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startsAt" required>
                Início
              </Label>
              <Input id="startsAt" type="datetime-local" required {...register("startsAt")} />
              <FieldError>{errors.startsAt?.message}</FieldError>
            </div>
            <div>
              <Label htmlFor="endsAt" required>
                Fim
              </Label>
              <Input id="endsAt" type="datetime-local" required {...register("endsAt")} />
              <FieldError>{errors.endsAt?.message}</FieldError>
            </div>
          </div>
          <div>
            <Label htmlFor="reason">Motivo</Label>
            <Select id="reason" {...register("reason")}>
              {Object.entries(REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="note">Nota (opcional)</Label>
            <Textarea id="note" {...register("note")} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" isLoading={isPending}>
              Criar bloqueio
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
}
