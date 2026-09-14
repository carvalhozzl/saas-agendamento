"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { professionalSchema, type ProfessionalInput } from "@/lib/validations/professional";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Service } from "@prisma/client";

export function ProfessionalForm({
  services,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  services: Service[];
  defaultValues?: Partial<ProfessionalInput>;
  onSubmit: (data: ProfessionalInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfessionalInput>({
    resolver: zodResolver(professionalSchema) as Resolver<ProfessionalInput>,
    defaultValues: { name: "", phone: "", email: "", bio: "", serviceIds: [], ...defaultValues },
  });

  const selectedServices = watch("serviceIds");

  function toggleService(id: string) {
    const current = selectedServices ?? [];
    setValue("serviceIds", current.includes(id) ? current.filter((s) => s !== id) : [...current, id]);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" required>
          Nome
        </Label>
        <Input id="name" {...register("name")} placeholder="Carlos Souza" />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input id="phone" {...register("phone")} placeholder="(11) 99999-9999" />
        </div>
        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" {...register("email")} placeholder="opcional" />
          <FieldError>{errors.email?.message}</FieldError>
        </div>
      </div>
      <div>
        <Label htmlFor="bio">Especialidades</Label>
        <Textarea id="bio" {...register("bio")} placeholder="Ex: cortes modernos, barba" />
      </div>
      <div>
        <Label>Serviços realizados</Label>
        {services.length === 0 ? (
          <p className="text-sm text-muted">Cadastre serviços primeiro.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {services.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => toggleService(s.id)}
                className={
                  "px-3 py-1.5 rounded-full text-sm border transition-colors " +
                  (selectedServices?.includes(s.id)
                    ? "bg-brand text-white border-brand"
                    : "bg-surface text-foreground border-border hover:bg-muted-surface")
                }
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Salvar
        </Button>
      </div>
    </form>
  );
}
