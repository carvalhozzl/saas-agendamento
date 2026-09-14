"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { UserRound, Plus, Pencil, Trash2, Power, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ProfessionalForm } from "@/components/professionals/professional-form";
import type { ProfessionalInput } from "@/lib/validations/professional";
import {
  createProfessionalAction,
  updateProfessionalAction,
  toggleProfessionalStatusAction,
  deleteProfessionalAction,
} from "./actions";
import type { Professional, Service, ProfessionalService } from "@prisma/client";

type ProfessionalWithServices = Professional & {
  services: (ProfessionalService & { service: Service })[];
};

export function ProfessionalsClient({
  professionals,
  services,
}: {
  professionals: ProfessionalWithServices[];
  services: Service[];
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ProfessionalWithServices | null>(null);
  const [isPending, startTransition] = useTransition();

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function handleSubmit(data: ProfessionalInput) {
    startTransition(async () => {
      try {
        if (editing) {
          await updateProfessionalAction(editing.id, data);
          toast.success("Profissional atualizado.");
        } else {
          await createProfessionalAction(data);
          toast.success("Profissional cadastrado.");
        }
        setModalOpen(false);
      } catch {
        toast.error("Não foi possível salvar o profissional.");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este profissional?")) return;
    startTransition(async () => {
      try {
        await deleteProfessionalAction(id);
        toast.success("Profissional excluído.");
      } catch {
        toast.error("Não foi possível excluir. Verifique se há agendamentos vinculados.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Profissionais</h1>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" /> Novo profissional
        </Button>
      </div>

      <Card>
        {professionals.length === 0 ? (
          <EmptyState
            icon={UserRound}
            title="Nenhum profissional cadastrado."
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" /> Novo profissional
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {professionals.map((p) => (
              <li key={p.id} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-semibold shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{p.name}</p>
                    <Badge tone={p.status === "ACTIVE" ? "success" : "neutral"}>
                      {p.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted mt-0.5 truncate">
                    {p.services.length > 0 ? p.services.map((s) => s.service.name).join(", ") : "Nenhum serviço vinculado"}
                  </p>
                </div>
                <Link
                  href={`/horarios?profissional=${p.id}`}
                  title="Horários de trabalho"
                  className="p-2 rounded-lg text-muted hover:bg-muted-surface hover:text-foreground"
                >
                  <Clock className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => startTransition(() => toggleProfessionalStatusAction(p.id))}
                  title="Ativar/Inativar"
                  className="p-2 rounded-lg text-muted hover:bg-muted-surface hover:text-foreground"
                >
                  <Power className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditing(p);
                    setModalOpen(true);
                  }}
                  title="Editar"
                  className="p-2 rounded-lg text-muted hover:bg-muted-surface hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(p.id)}
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
        title={editing ? "Editar profissional" : "Novo profissional"}
      >
        <ProfessionalForm
          services={services}
          defaultValues={
            editing
              ? {
                  name: editing.name,
                  phone: editing.phone ?? "",
                  email: editing.email ?? "",
                  bio: editing.bio ?? "",
                  serviceIds: editing.services.map((s) => s.serviceId),
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
