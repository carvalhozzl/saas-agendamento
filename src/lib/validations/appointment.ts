import { z } from "zod";

export const appointmentSchema = z.object({
  clientId: z.string().uuid("Selecione um cliente"),
  serviceId: z.string().uuid("Selecione um serviço"),
  professionalId: z.string().uuid("Selecione um profissional"),
  date: z.string().min(1, "Selecione uma data"), // "yyyy-MM-dd"
  time: z.string().min(1, "Selecione um horário"), // "HH:mm"
  notes: z.string().trim().max(500).optional().or(z.literal("")),
  status: z.enum(["PENDING", "CONFIRMED"]).default("PENDING"),
});

export type AppointmentInput = z.infer<typeof appointmentSchema>;

export const publicBookingSchema = z.object({
  organizationSlug: z.string().min(1),
  serviceId: z.string().uuid(),
  professionalId: z.string().uuid(),
  date: z.string().min(1),
  time: z.string().min(1),
  clientName: z.string().trim().min(2, "Informe seu nome"),
  clientWhatsapp: z.string().trim().min(8, "Informe um WhatsApp válido"),
});

export type PublicBookingInput = z.infer<typeof publicBookingSchema>;
