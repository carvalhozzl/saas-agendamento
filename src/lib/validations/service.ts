import { z } from "zod";

export const serviceSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do serviço"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  priceCents: z.coerce.number().int().min(0, "Preço inválido"),
  durationMin: z.coerce.number().int().min(5, "Duração mínima de 5 minutos"),
  professionalIds: z.array(z.string().uuid()).default([]),
});

export type ServiceInput = z.infer<typeof serviceSchema>;
