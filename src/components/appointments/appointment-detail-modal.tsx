"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { MessageCircle } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AppointmentStatusBadge } from "@/components/ui/badge";
import { Textarea, Label } from "@/components/ui/input";
import { formatCurrencyCents } from "@/lib/utils";
import {
  updateAppointmentStatusAction,
  sendWhatsAppNotificationAction,
} from "@/app/(app)/agendamentos/actions";
import type { Appointment, Client, Professional, Service } from "@prisma/client";

type AppointmentWithRelations = Appointment & {
  client: Client;
  professional: Professional;
  service: Service;
};

export function AppointmentDetailModal({
  appointment,
  onClose,
}: {
  appointment: AppointmentWithRelations | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

  if (!appointment) return null;

  function updateStatus(status: "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW") {
    startTransition(async () => {
      try {
        await updateAppointmentStatusAction(appointment!.id, status, status === "CANCELLED" ? cancelReason : undefined);
        toast.success("Status atualizado.");
        onClose();
      } catch {
        toast.error("Não foi possível atualizar o status.");
      }
    });
  }

  function notify(type: "CONFIRMATION" | "REMINDER" | "CANCELLATION" | "RESCHEDULE") {
    startTransition(async () => {
      try {
        await sendWhatsAppNotificationAction(appointment!.id, type);
        toast.success("Mensagem enviada pelo WhatsApp.");
      } catch {
        toast.error("Não foi possível enviar a mensagem.");
      }
    });
  }

  return (
    <Modal open={!!appointment} onClose={onClose} title="Detalhes do agendamento" size="sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">{appointment.client.name}</p>
            <p className="text-xs text-muted">
              {format(appointment.startsAt, "dd/MM/yyyy 'às' HH:mm")}
            </p>
          </div>
          <AppointmentStatusBadge status={appointment.status} />
        </div>

        <div className="rounded-lg bg-muted-surface p-3 text-sm space-y-1">
          <p>
            <span className="text-muted">Serviço:</span> {appointment.service.name}
          </p>
          <p>
            <span className="text-muted">Profissional:</span> {appointment.professional.name}
          </p>
          <p>
            <span className="text-muted">Valor:</span> {formatCurrencyCents(appointment.priceCents)}
          </p>
          {appointment.notes && (
            <p>
              <span className="text-muted">Observação:</span> {appointment.notes}
            </p>
          )}
        </div>

        {showCancelForm ? (
          <div className="space-y-2">
            <Label htmlFor="cancelReason">Motivo do cancelamento (opcional)</Label>
            <Textarea id="cancelReason" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCancelForm(false)}>
                Voltar
              </Button>
              <Button variant="danger" isLoading={isPending} onClick={() => updateStatus("CANCELLED")}>
                Confirmar cancelamento
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {appointment.status === "PENDING" && (
                <Button size="sm" isLoading={isPending} onClick={() => updateStatus("CONFIRMED")}>
                  Confirmar
                </Button>
              )}
              {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
                <Button size="sm" variant="secondary" isLoading={isPending} onClick={() => updateStatus("COMPLETED")}>
                  Marcar como concluído
                </Button>
              )}
              {(appointment.status === "PENDING" || appointment.status === "CONFIRMED") && (
                <Button size="sm" variant="secondary" isLoading={isPending} onClick={() => updateStatus("NO_SHOW")}>
                  Cliente faltou
                </Button>
              )}
              {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
                <Button size="sm" variant="outline" onClick={() => setShowCancelForm(true)}>
                  Cancelar
                </Button>
              )}
            </div>

            <div className="border-t border-border pt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" isLoading={isPending} onClick={() => notify("CONFIRMATION")}>
                <MessageCircle className="h-4 w-4" /> Confirmação
              </Button>
              <Button size="sm" variant="outline" isLoading={isPending} onClick={() => notify("REMINDER")}>
                <MessageCircle className="h-4 w-4" /> Lembrete
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
