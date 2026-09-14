"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { AppointmentStatusBadge } from "@/components/ui/badge";
import { NewAppointmentModal } from "@/components/appointments/new-appointment-modal";
import { AppointmentDetailModal } from "@/components/appointments/appointment-detail-modal";
import { cn, formatCurrencyCents } from "@/lib/utils";
import { format } from "date-fns";
import type { Appointment, Client, Professional, Service } from "@prisma/client";

type AppointmentWithRelations = Appointment & { client: Client; professional: Professional; service: Service };

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todos" },
  { value: "PENDING", label: "Pendentes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "COMPLETED", label: "Concluídos" },
  { value: "CANCELLED", label: "Cancelados" },
  { value: "NO_SHOW", label: "Faltas" },
];

export function AgendamentosClient({
  appointments,
  clients,
  services,
  professionals,
  currentStatus,
}: {
  appointments: AppointmentWithRelations[];
  clients: Client[];
  services: Service[];
  professionals: Professional[];
  currentStatus: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(searchParams.get("novo") === "1");
  const [selected, setSelected] = useState<AppointmentWithRelations | null>(null);

  useEffect(() => {
    if (searchParams.get("novo") !== "1") return;
    queueMicrotask(() => {
      setModalOpen(true);
      router.replace("/agendamentos", { scroll: false });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  function setStatusFilter(status: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (status) params.set("status", status);
    else params.delete("status");
    router.push(`/agendamentos?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Agendamentos</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Novo agendamento
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap border transition-colors",
              currentStatus === f.value
                ? "bg-brand text-white border-brand"
                : "bg-surface text-foreground border-border hover:bg-muted-surface"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Card>
        {appointments.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Você ainda não possui agendamentos."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" /> Criar agendamento
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {appointments.map((a) => (
              <li
                key={a.id}
                onClick={() => setSelected(a)}
                className="flex items-center gap-4 px-5 py-3.5 cursor-pointer hover:bg-muted-surface/60"
              >
                <div className="w-32 shrink-0 text-sm text-foreground">
                  <p className="font-medium">{format(a.startsAt, "dd/MM/yyyy")}</p>
                  <p className="text-xs text-muted">{format(a.startsAt, "HH:mm")}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.client.name}</p>
                  <p className="text-xs text-muted truncate">
                    {a.service.name} · {a.professional.name}
                  </p>
                </div>
                <div className="hidden sm:block text-sm text-muted w-24 text-right">
                  {formatCurrencyCents(a.priceCents)}
                </div>
                <AppointmentStatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>

      <NewAppointmentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        clients={clients}
        services={services}
        professionals={professionals}
      />
      <AppointmentDetailModal appointment={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
