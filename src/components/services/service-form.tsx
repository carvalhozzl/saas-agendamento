"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema, type ServiceInput } from "@/lib/validations/service";
import { Input, Label, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Professional } from "@prisma/client";

export function ServiceForm({
  professionals,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  professionals: Professional[];
  defaultValues?: Partial<ServiceInput>;
  onSubmit: (data: ServiceInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ServiceInput>({
    resolver: zodResolver(serviceSchema) as Resolver<ServiceInput>,
    defaultValues: {
      name: "",
      description: "",
      category: "",
      priceCents: 0,
      durationMin: 30,
      professionalIds: [],
      ...defaultValues,
    },
  });

  const selectedProfessionals = watch("professionalIds");

  function toggleProfessional(id: string) {
    const current = selectedProfessionals ?? [];
    setValue(
      "professionalIds",
      current.includes(id) ? current.filter((p) => p !== id) : [...current, id]
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name" required>
          Nome
        </Label>
        <Input id="name" {...register("name")} placeholder="Corte Masculino" />
        <FieldError>{errors.name?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea id="description" {...register("description")} placeholder="Opcional" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input id="category" {...register("category")} placeholder="Cabelo" />
        </div>
        <div>
          <Label htmlFor="priceCents" required>
            Preço (R$)
          </Label>
          <Input
            id="priceCents"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.priceCents ? defaultValues.priceCents / 100 : undefined}
            onChange={(e) => setValue("priceCents", Math.round(Number(e.target.value) * 100))}
          />
          <FieldError>{errors.priceCents?.message}</FieldError>
        </div>
      </div>
      <div>
        <Label htmlFor="durationMin" required>
          Duração (minutos)
        </Label>
        <Input id="durationMin" type="number" step="5" min="5" {...register("durationMin")} />
        <FieldError>{errors.durationMin?.message}</FieldError>
      </div>
      <div>
        <Label>Profissionais que realizam este serviço</Label>
        {professionals.length === 0 ? (
          <p className="text-sm text-muted">Cadastre profissionais primeiro.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {professionals.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => toggleProfessional(p.id)}
                className={
                  "px-3 py-1.5 rounded-full text-sm border transition-colors " +
                  (selectedProfessionals?.includes(p.id)
                    ? "bg-brand text-white border-brand"
                    : "bg-surface text-foreground border-border hover:bg-muted-surface")
                }
              >
                {p.name}
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
