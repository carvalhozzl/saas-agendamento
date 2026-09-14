import { z } from "zod";

export const professionalSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do profissional"),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  email: z.string().trim().email("E-mail inválido").optional().or(z.literal("")),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  serviceIds: z.array(z.string().uuid()).default([]),
});

export type ProfessionalInput = z.infer<typeof professionalSchema>;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const workingHourSchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    enabled: z.boolean(),
    startTime: z.string().regex(timeRegex, "Horário inválido"),
    endTime: z.string().regex(timeRegex, "Horário inválido"),
    breakStart: z.string().regex(timeRegex).optional().or(z.literal("")),
    breakEnd: z.string().regex(timeRegex).optional().or(z.literal("")),
  })
  .refine((v) => !v.enabled || v.startTime < v.endTime, {
    message: "O horário final deve ser após o inicial",
    path: ["endTime"],
  });

export type WorkingHourInput = z.infer<typeof workingHourSchema>;

export const blockedPeriodSchema = z
  .object({
    professionalId: z.string().uuid().optional().or(z.literal("")),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    reason: z.enum(["MEETING", "DAY_OFF", "MAINTENANCE", "VACATION", "HOLIDAY", "OTHER"]),
    note: z.string().trim().max(300).optional().or(z.literal("")),
  })
  .refine((v) => v.endsAt > v.startsAt, {
    message: "O fim deve ser após o início",
    path: ["endsAt"],
  });

export type BlockedPeriodInput = z.infer<typeof blockedPeriodSchema>;
