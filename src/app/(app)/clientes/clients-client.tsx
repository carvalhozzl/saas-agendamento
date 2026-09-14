"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { ClientForm } from "@/components/clients/client-form";
import type { ClientInput } from "@/lib/validations/client";
import { createClientAction, updateClientAction, deleteClientAction } from "./actions";
import type { Client } from "@prisma/client";

export function ClientsClient({ clients, search }: { clients: Client[]; search: string }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Client | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(data: ClientInput) {
    startTransition(async () => {
      try {
        if (editing) {
          await updateClientAction(editing.id, data);
          toast.success("Cliente atualizado.");
        } else {
          await createClientAction(data);
          toast.success("Cliente cadastrado.");
        }
        setModalOpen(false);
      } catch {
        toast.error("Não foi possível salvar o cliente.");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este cliente?")) return;
    startTransition(async () => {
      try {
        await deleteClientAction(id);
        toast.success("Cliente excluído.");
      } catch {
        toast.error("Não foi possível excluir este cliente.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-foreground">Clientes</h1>
        <Button
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Adicionar cliente
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
        <Input
          defaultValue={search}
          placeholder="Buscar por nome ou telefone"
          className="pl-9"
          onChange={(e) => {
            const params = new URLSearchParams(window.location.search);
            if (e.target.value) params.set("busca", e.target.value);
            else params.delete("busca");
            router.replace(`/clientes?${params.toString()}`);
          }}
        />
      </div>

      <Card>
        {clients.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum cliente cadastrado."
            action={
              <Button
                onClick={() => {
                  setEditing(null);
                  setModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" /> Adicionar cliente
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {clients.map((c) => (
              <li key={c.id} className="flex items-center gap-4 px-5 py-4">
                <div className="h-10 w-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-semibold shrink-0">
                  {c.name.charAt(0).toUpperCase()}
                </div>
                <Link href={`/clientes/${c.id}`} className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground hover:underline">{c.name}</p>
                  <p className="text-xs text-muted mt-0.5">{c.whatsapp || c.phone || "Sem contato cadastrado"}</p>
                </Link>
                <button
                  onClick={() => {
                    setEditing(c);
                    setModalOpen(true);
                  }}
                  title="Editar"
                  className="p-2 rounded-lg text-muted hover:bg-muted-surface hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
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

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Editar cliente" : "Novo cliente"}>
        <ClientForm
          defaultValues={
            editing
              ? {
                  name: editing.name,
                  phone: editing.phone ?? "",
                  whatsapp: editing.whatsapp ?? "",
                  email: editing.email ?? "",
                  notes: editing.notes ?? "",
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
