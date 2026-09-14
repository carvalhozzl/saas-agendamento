"use server";

import { prisma } from "@/lib/db/prisma";
import { getAvailableSlots } from "@/services/appointments/availability";
import { createAppointment, SchedulingConflictError } from "@/services/appointments/appointment.service";
import { sendAppointmentNotification } from "@/services/notifications/notification.service";
import { publicBookingSchema, type PublicBookingInput } from "@/lib/validations/appointment";

async function getBookableOrganization(slug: string) {
  const organization = await prisma.organization.findUnique({ where: { slug } });
  if (!organization) throw new Error("Estabelecimento não encontrado.");
  if (organization.status === "SUSPENDED" || organization.status === "CANCELLED") {
    throw new Error("Este estabelecimento não está aceitando agendamentos no momento.");
  }
  return organization;
}

export async function getPublicAvailableSlotsAction({
  organizationSlug,
  professionalId,
  serviceId,
  date,
}: {
  organizationSlug: string;
  professionalId: string;
  serviceId: string;
  date: string;
}) {
  const organization = await getBookableOrganization(organizationSlug);
  return getAvailableSlots({
    organizationId: organization.id,
    professionalId,
    serviceId,
    date: new Date(`${date}T00:00:00`),
  });
}

export async function createPublicBookingAction(input: PublicBookingInput) {
  const data = publicBookingSchema.parse(input);
  const organization = await getBookableOrganization(data.organizationSlug);

  let client = await prisma.client.findFirst({
    where: { organizationId: organization.id, whatsapp: data.clientWhatsapp },
  });
  if (!client) {
    client = await prisma.client.create({
      data: {
        organizationId: organization.id,
        name: data.clientName,
        whatsapp: data.clientWhatsapp,
      },
    });
  }

  const startsAt = new Date(`${data.date}T${data.time}:00`);

  try {
    const appointment = await createAppointment({
      organizationId: organization.id,
      clientId: client.id,
      serviceId: data.serviceId,
      professionalId: data.professionalId,
      startsAt,
      status: "PENDING",
    });

    if (process.env.WHATSAPP_API_TOKEN) {
      await sendAppointmentNotification(appointment.id, "CONFIRMATION").catch(() => undefined);
    }

    return { id: appointment.id };
  } catch (error) {
    if (error instanceof SchedulingConflictError) {
      throw new Error(error.message);
    }
    throw error;
  }
}
