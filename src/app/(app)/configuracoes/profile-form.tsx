"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateProfileAction } from "./actions";
import type { Organization } from "@prisma/client";

export function ProfileForm({ organization }: { organization: Organization }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateProfileAction(formData);
        toast.success("Dados atualizados com sucesso.");
      } catch {
        toast.error("Não foi possível salvar as alterações.");
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name" required>
          Nome do negócio
        </Label>
        <Input id="name" name="name" defaultValue={organization.name} required />
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={organization.description ?? ""}
          placeholder="Uma breve descrição para a página pública de agendamento"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" name="phone" defaultValue={organization.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={organization.whatsapp ?? ""} />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Endereço</Label>
        <Input id="address" name="address" defaultValue={organization.address ?? ""} />
      </div>
      <Button type="submit" isLoading={isPending}>
        Salvar alterações
      </Button>
    </form>
  );
}
