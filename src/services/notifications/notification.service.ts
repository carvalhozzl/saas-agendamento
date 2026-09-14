import "server-only";
import { prisma } from "@/lib/db/prisma";
import { getWhatsAppProvider } from "@/lib/whatsapp/provider";
import { format } from "date-fns";
import type { NotificationType } from "@prisma/client";

const TEMPLATES: Record<NotificationType, (v: TemplateVars) => string> = {
  CONFIRMATION: (v) =>
    `Olá, ${v.clientName}! Seu agendamento foi confirmado para ${v.date} às ${v.time} com ${v.professionalName}.`,
  REMINDER: (v) =>
    `Olá, ${v.clientName}! Passando para lembrar que seu atendimento está marcado para ${v.date} às ${v.time}.`,
  CANCELLATION: (v) =>
    `Olá, ${v.clientName}. Seu agendamento de ${v.date} às ${v.time} foi cancelado.`,
  RESCHEDULE: (v) =>
    `Olá, ${v.clientName}! Seu atendimento foi reagendado para ${v.date} às ${v.time}.`,
};

interface TemplateVars {
  clientName: string;
  date: string;
  time: string;
  professionalName: string;
}

export async function sendAppointmentNotification(
  appointmentId: string,
  type: NotificationType
) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { client: true, professional: true },
  });
  if (!appointment) throw new Error("Agendamento não encontrado.");

  const phone = appointment.client.whatsapp || appointment.client.phone;
  if (!phone) throw new Error("Cliente não possui WhatsApp cadastrado.");

  const message = TEMPLATES[type]({
    clientName: appointment.client.name,
    date: format(appointment.startsAt, "dd/MM/yyyy"),
    time: format(appointment.startsAt, "HH:mm"),
    professionalName: appointment.professional.name,
  });

  const notification = await prisma.notification.create({
    data: {
      organizationId: appointment.organizationId,
      appointmentId: appointment.id,
      type,
      recipientPhone: phone,
      message,
      status: "PENDING",
    },
  });

  try {
    const provider = getWhatsAppProvider();
    await provider.send({ toPhone: phone, body: message });
    return prisma.notification.update({
      where: { id: notification.id },
      data: { status: "SENT", sentAt: new Date() },
    });
  } catch (error) {
    return prisma.notification.update({
      where: { id: notification.id },
      data: { status: "FAILED", error: error instanceof Error ? error.message : "Erro desconhecido" },
    });
  }
}
