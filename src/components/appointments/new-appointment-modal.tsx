"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { AppointmentForm } from "@/components/appointments/appointment-form";
import { createAppointmentAction, sendWhatsAppNotificationAction } from "@/app/(app)/agendamentos/actions";
import type { AppointmentInput } from "@/lib/validations/appointment";
import type { Client, Professional, Service } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export function NewAppointmentModal({
  open,
  onClose,
  clients,
  services,
  professionals,
  defaultDate,
}: {
  open: boolean;
  onClose: () => void;
  clients: Client[];
  services: Service[];
  professionals: Professional[];
  defaultDate?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [createdId, setCreatedId] = useState<string | null>(null);

  function handleSubmit(data: AppointmentInput) {
    startTransition(async () => {
      try {
        const result = await createAppointmentAction(data);
        setCreatedId(result.id);
        toast.success("Agendamento criado com sucesso.");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível criar o agendamento.");
      }
    });
  }

  function handleSendWhatsApp() {
    if (!createdId) return;
    startTransition(async () => {
      try {
        await sendWhatsAppNotificationAction(createdId, "CONFIRMATION");
        toast.success("Confirmação enviada pelo WhatsApp.");
      } catch {
        toast.error("Não foi possível enviar a confirmação.");
      } finally {
        handleClose();
      }
    });
  }

  function handleClose() {
    setCreatedId(null);
    onClose();
  }

  if (createdId) {
    return (
      <Modal open={open} onClose={handleClose} title="Agendamento realizado com sucesso!" size="sm">
        <div className="space-y-4 text-center py-2">
          <div className="mx-auto h-12 w-12 rounded-full bg-success-bg flex items-center justify-center text-2xl">
            ✅
          </div>
          <p className="text-sm text-muted">Deseja avisar o cliente agora pelo WhatsApp?</p>
          <div className="flex flex-col gap-2">
            <Button onClick={handleSendWhatsApp} isLoading={isPending}>
              <MessageCircle className="h-4 w-4" /> Enviar confirmação pelo WhatsApp
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Agora não
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Novo agendamento" size="lg">
      <AppointmentForm
        clients={clients}
        services={services}
        professionals={professionals}
        defaultDate={defaultDate}
        onSubmit={handleSubmit}
        onCancel={handleClose}
        isSubmitting={isPending}
      />
    </Modal>
  );
}
