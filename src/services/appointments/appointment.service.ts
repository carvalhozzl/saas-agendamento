import "server-only";
import { prisma } from "@/lib/db/prisma";
import { addMinutes } from "date-fns";
import { isSlotAvailable } from "./availability";
import type { AppointmentStatus } from "@prisma/client";

export class SchedulingConflictError extends Error {
  constructor(message = "Este horário não está mais disponível.") {
    super(message);
    this.name = "SchedulingConflictError";
  }
}

export async function listAppointmentsInRange({
  organizationId,
  from,
  to,
  professionalId,
}: {
  organizationId: string;
  from: Date;
  to: Date;
  professionalId?: string;
}) {
  return prisma.appointment.findMany({
    where: {
      organizationId,
      professionalId,
      startsAt: { gte: from, lte: to },
    },
    include: { client: true, professional: true, service: true },
    orderBy: { startsAt: "asc" },
  });
}

export async function listAppointments({
  organizationId,
  status,
  search,
}: {
  organizationId: string;
  status?: AppointmentStatus;
  search?: string;
}) {
  return prisma.appointment.findMany({
    where: {
      organizationId,
      status,
      ...(search
        ? { client: { name: { contains: search, mode: "insensitive" as const } } }
        : {}),
    },
    include: { client: true, professional: true, service: true },
    orderBy: { startsAt: "desc" },
    take: 200,
  });
}

export async function createAppointment({
  organizationId,
  clientId,
  serviceId,
  professionalId,
  startsAt,
  notes,
  status,
}: {
  organizationId: string;
  clientId: string;
  serviceId: string;
  professionalId: string;
  startsAt: Date;
  notes?: string;
  status: AppointmentStatus;
}) {
  const service = await prisma.service.findFirst({
    where: { id: serviceId, organizationId },
  });
  if (!service) throw new Error("Serviço não encontrado.");

  const available = await isSlotAvailable({
    organizationId,
    professionalId,
    serviceId,
    startsAt,
  });
  if (!available) throw new SchedulingConflictError();

  const endsAt = addMinutes(startsAt, service.durationMin);

  // Re-validate uniqueness atomically to close the race between the
  // availability check above and this write.
  return prisma.$transaction(async (tx) => {
    const conflict = await tx.appointment.findFirst({
      where: {
        organizationId,
        professionalId,
        status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });
    if (conflict) throw new SchedulingConflictError();

    return tx.appointment.create({
      data: {
        organizationId,
        clientId,
        serviceId,
        professionalId,
        startsAt,
        endsAt,
        notes: notes || null,
        status,
        priceCents: service.priceCents,
      },
      include: { client: true, professional: true, service: true },
    });
  });
}

export async function updateAppointmentStatus({
  organizationId,
  appointmentId,
  status,
  cancelReason,
}: {
  organizationId: string;
  appointmentId: string;
  status: AppointmentStatus;
  cancelReason?: string;
}) {
  const appointment = await prisma.appointment.findFirst({
    where: { id: appointmentId, organizationId },
  });
  if (!appointment) throw new Error("Agendamento não encontrado.");

  return prisma.appointment.update({
    where: { id: appointmentId },
    data: { status, cancelReason: status === "CANCELLED" ? cancelReason || null : null },
    include: { client: true, professional: true, service: true },
  });
}

export async function getTodayStats(organizationId: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const appointments = await prisma.appointment.findMany({
    where: { organizationId, startsAt: { gte: start, lte: end } },
  });

  return {
    total: appointments.length,
    confirmed: appointments.filter((a) => a.status === "CONFIRMED").length,
    pending: appointments.filter((a) => a.status === "PENDING").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED" || a.status === "NO_SHOW").length,
    expectedRevenueCents: appointments
      .filter((a) => a.status !== "CANCELLED" && a.status !== "NO_SHOW")
      .reduce((sum, a) => sum + a.priceCents, 0),
  };
}
