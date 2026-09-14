import type { BusinessSegment } from "@prisma/client";

export const SEGMENT_LABELS: Record<BusinessSegment, string> = {
  BARBERSHOP: "Barbearia",
  HAIR_SALON: "Salão de beleza",
  AESTHETIC_CLINIC: "Clínica de estética",
  NAIL_DESIGNER: "Manicure / Nail designer",
  LASH_DESIGNER: "Lash designer",
  TATTOO_STUDIO: "Estúdio de tatuagem",
  MASSAGE_THERAPIST: "Massoterapeuta",
  PERSONAL_TRAINER: "Personal trainer",
  CLINIC: "Clínica",
  OTHER: "Outro",
};

export const WEEKDAY_LABELS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
