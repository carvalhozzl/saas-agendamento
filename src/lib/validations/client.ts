import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do cliente"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  birthDate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : val),
    z.coerce.date().optional()
  ),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type ClientInput = z.infer<typeof clientSchema>;
