"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Scissors, Plus, Pencil, Trash2, Power } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ServiceForm } from "@/components/services/service-form";
import { formatCurrencyCents, formatDurationMin } from "@/lib/utils";
import type { ServiceInput } from "@/lib/validations/service";
import {
  createServiceAction,
  updateServiceAction,
  toggleServiceStatusAction,
  deleteServiceAction,
} from "./actions";
import type { Professional, Service, ProfessionalService } from "@prisma/client";

type ServiceWithPros = Service & { professionals: (ProfessionalService & { professional: Professional })[] };

export function ServicesClient({
  services,
  professionals,
}: {
  services: ServiceWithPros[];
  professionals: Professional[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceWithPros | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(service: ServiceWithPros) {
    setEditing(service);
    setModalOpen(true);
  }

  function handleSubmit(data: ServiceInput) {
    startTransition(async () => {
      try {
        if (editing) {
          await updateServiceAction(editing.id, data);
          toast.success("Serviço atualizado com sucesso.");
        } else {
          await createServiceAction(data);
          toast.success("Serviço criado com sucesso.");
        }
        setModalOpen(false);
      } catch {
        toast.error("Não foi possível salvar o serviço.");
      }
    });
  }

  function handleToggle(id: string) {
    startTransition(async () => {
      await toggleServiceStatusAction(id);
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
    startTransition(async () => {
      try {
        await deleteServiceAction(id);
        toast.success("Serviço excluído.");
      } catch {
        toast.error("Não foi possível excluir este serviço.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Serviços</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo serviço
        </Button>
      </div>

      <Card>
        {services.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="Cadastre seu primeiro serviço para começar."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Novo serviço
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {services.map((service) => (
              <li key={service.id} className="flex items-center gap-4 px-5 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{service.name}</p>
                    <Badge tone={service.status === "ACTIVE" ? "success" : "neutral"}>
                      {service.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5">
                    {formatCurrencyCents(service.priceCents)} · {formatDurationMin(service.durationMin)}
                    {service.professionals.length > 0 &&
                      ` · ${service.professionals.map((p) => p.professional.name).join(", ")}`}
                  </p>
                </div>
                <button
                  onClick={() => handleToggle(service.id)}
                  disabled={isPending}
                  title="Ativar/Inativar"
                  className="p-2 rounded-lg text-muted hover:bg-muted-surface hover:text-foreground"
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  onClick={() => openEdit(service)}
                  title="Editar"
                  className="p-2 rounded-lg text-muted hover:bg-muted-surface hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  disabled={isPending}
                  title="Excluir"
                  className="p-2 rounded-lg text-muted hover:bg-danger-bg hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Editar serviço" : "Novo serviço"}
      >
        <ServiceForm
          professionals={professionals}
          defaultValues={
            editing
              ? {
                  name: editing.name,
                  description: editing.description ?? "",
                  category: editing.category ?? "",
                  priceCents: editing.priceCents,
                  durationMin: editing.durationMin,
                  professionalIds: editing.professionals.map((p) => p.professionalId),
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isSubmitting={isPending}
        />
      </Modal>
    </div>
  );
}
