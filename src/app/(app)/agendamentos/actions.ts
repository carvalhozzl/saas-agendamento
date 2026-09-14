"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/context";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations/appointment";
import { getAvailableSlots } from "@/services/appointments/availability";
import {
  createAppointment,
  updateAppointmentStatus,
  SchedulingConflictError,
} from "@/services/appointments/appointment.service";
import { sendAppointmentNotification } from "@/services/notifications/notification.service";
import type { AppointmentStatus } from "@prisma/client";

export async function getAvailableSlotsAction({
  professionalId,
  serviceId,
  date,
}: {
  professionalId: string;
  serviceId: string;
  date: string;
}) {
  const { organizationId } = await requireOrgContext();
  return getAvailableSlots({
    organizationId,
    professionalId,
    serviceId,
    date: new Date(`${date}T00:00:00`),
  });
}

export async function createAppointmentAction(input: AppointmentInput) {
  const { organizationId } = await requireOrgContext();
  const data = appointmentSchema.parse(input);
  const startsAt = new Date(`${data.date}T${data.time}:00`);

  try {
    const appointment = await createAppointment({
      organizationId,
      clientId: data.clientId,
      serviceId: data.serviceId,
      professionalId: data.professionalId,
      startsAt,
      notes: data.notes,
      status: data.status,
    });
    revalidatePath("/agenda");
    revalidatePath("/agendamentos");
    revalidatePath("/dashboard");
    return { id: appointment.id };
  } catch (error) {
    if (error instanceof SchedulingConflictError) {
      throw new Error(error.message);
    }
    throw error;
  }
}

export async function updateAppointmentStatusAction(
  id: string,
  status: AppointmentStatus,
  cancelReason?: string
) {
  const { organizationId } = await requireOrgContext();
  await updateAppointmentStatus({ organizationId, appointmentId: id, status, cancelReason });
  revalidatePath("/agenda");
  revalidatePath("/agendamentos");
  revalidatePath("/dashboard");
}

export async function sendWhatsAppNotificationAction(
  appointmentId: string,
  type: "CONFIRMATION" | "REMINDER" | "CANCELLATION" | "RESCHEDULE"
) {
  await requireOrgContext();
  await sendAppointmentNotification(appointmentId, type);
}
