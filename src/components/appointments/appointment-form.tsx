"use client";

import { useEffect, useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations/appointment";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAvailableSlotsAction } from "@/app/(app)/agendamentos/actions";
import { format } from "date-fns";
import type { Client, Professional, Service } from "@prisma/client";

export function AppointmentForm({
  clients,
  services,
  professionals,
  defaultDate,
  onSubmit,
  onCancel,
  isSubmitting,
}: {
  clients: Client[];
  services: Service[];
  professionals: Professional[];
  defaultDate?: string;
  onSubmit: (data: AppointmentInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema) as Resolver<AppointmentInput>,
    defaultValues: {
      clientId: "",
      serviceId: "",
      professionalId: "",
      date: defaultDate ?? format(new Date(), "yyyy-MM-dd"),
      time: "",
      notes: "",
      status: "PENDING",
    },
  });

  const serviceId = watch("serviceId");
  const professionalId = watch("professionalId");
  const date = watch("date");

  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (!serviceId || !professionalId || !date) {
      setSlots([]);
      return;
    }
    setLoadingSlots(true);
    getAvailableSlotsAction({ professionalId, serviceId, date })
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }, [serviceId, professionalId, date]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="clientId" required>
          Cliente
        </Label>
        <Select id="clientId" {...register("clientId")}>
          <option value="">Selecionar cliente</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <FieldError>{errors.clientId?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="serviceId" required>
          Serviço
        </Label>
        <Select id="serviceId" {...register("serviceId")}>
          <option value="">Selecionar serviço</option>
          {services.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <FieldError>{errors.serviceId?.message}</FieldError>
      </div>

      <div>
        <Label htmlFor="professionalId" required>
          Profissional
        </Label>
        <Select id="professionalId" {...register("professionalId")}>
          <option value="">Selecionar profissional</option>
          {professionals.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
        <FieldError>{errors.professionalId?.message}</FieldError>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="date" required>
            Data
          </Label>
          <Input id="date" type="date" min={format(new Date(), "yyyy-MM-dd")} {...register("date")} />
          <FieldError>{errors.date?.message}</FieldError>
        </div>
        <div>
          <Label htmlFor="time" required>
            Horário
          </Label>
          <Controller
            control={control}
            name="time"
            render={({ field }) => (
              <Select id="time" {...field} disabled={!serviceId || !professionalId || loadingSlots}>
                <option value="">
                  {loadingSlots
                    ? "Carregando..."
                    : !serviceId || !professionalId
                    ? "Selecione serviço e profissional"
                    : slots.length === 0
                    ? "Sem horários disponíveis"
                    : "Selecionar horário"}
                </option>
                {slots.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            )}
          />
          <FieldError>{errors.time?.message}</FieldError>
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Observação</Label>
        <Textarea id="notes" {...register("notes")} placeholder="Opcional" />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select id="status" {...register("status")}>
          <option value="PENDING">Pendente</option>
          <option value="CONFIRMED">Confirmado</option>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          Confirmar agendamento
        </Button>
      </div>
    </form>
  );
}
