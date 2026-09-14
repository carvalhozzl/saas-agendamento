import "server-only";
import { prisma } from "@/lib/db/prisma";
import { addMinutes, isBefore, startOfDay, endOfDay } from "date-fns";
import type { AppointmentStatus } from "@prisma/client";

const SLOT_STEP_MIN = 15;
const ACTIVE_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED", "COMPLETED"];

function timeToMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToDate(day: Date, minutes: number) {
  return addMinutes(startOfDay(day), minutes);
}

function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number) {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Computes bookable start times for a professional/service on a given day.
 * A slot is available when it fits entirely inside working hours, outside
 * any lunch break, doesn't collide with a blocked period (org-wide or
 * professional-specific), and doesn't overlap an existing appointment.
 */
export async function getAvailableSlots({
  organizationId,
  professionalId,
  serviceId,
  date,
}: {
  organizationId: string;
  professionalId: string;
  serviceId: string;
  date: Date;
}): Promise<string[]> {
  const weekday = date.getDay();

  const [service, professionalHours, orgHours, blockedPeriods, existingAppointments] =
    await Promise.all([
      prisma.service.findFirst({ where: { id: serviceId, organizationId } }),
      prisma.workingHour.findMany({
        where: { organizationId, professionalId, weekday },
      }),
      prisma.workingHour.findMany({
        where: { organizationId, professionalId: null, weekday },
      }),
      prisma.blockedPeriod.findMany({
        where: {
          organizationId,
          OR: [{ professionalId }, { professionalId: null }],
          startsAt: { lt: endOfDay(date) },
          endsAt: { gt: startOfDay(date) },
        },
      }),
      prisma.appointment.findMany({
        where: {
          organizationId,
          professionalId,
          status: { in: ACTIVE_STATUSES },
          startsAt: { lt: endOfDay(date) },
          endsAt: { gt: startOfDay(date) },
        },
        select: { startsAt: true, endsAt: true },
      }),
    ]);

  if (!service) return [];

  const hours = professionalHours.length > 0 ? professionalHours : orgHours;
  if (hours.length === 0) return [];

  const slots: string[] = [];

  for (const window of hours) {
    const windowStart = timeToMinutes(window.startTime);
    const windowEnd = timeToMinutes(window.endTime);
    const breakStart = window.breakStart ? timeToMinutes(window.breakStart) : null;
    const breakEnd = window.breakEnd ? timeToMinutes(window.breakEnd) : null;

    for (
      let slotStart = windowStart;
      slotStart + service.durationMin <= windowEnd;
      slotStart += SLOT_STEP_MIN
    ) {
      const slotEnd = slotStart + service.durationMin;

      if (breakStart !== null && breakEnd !== null && overlaps(slotStart, slotEnd, breakStart, breakEnd)) {
        continue;
      }

      const slotStartDate = minutesToDate(date, slotStart);
      const slotEndDate = minutesToDate(date, slotEnd);

      // Skip slots that have already passed, when booking for today.
      const isToday = startOfDay(date).getTime() === startOfDay(new Date()).getTime();
      if (isToday && isBefore(slotStartDate, new Date())) {
        continue;
      }

      const blocked = blockedPeriods.some((b) =>
        overlaps(slotStartDate.getTime(), slotEndDate.getTime(), b.startsAt.getTime(), b.endsAt.getTime())
      );
      if (blocked) continue;

      const taken = existingAppointments.some((a) =>
        overlaps(slotStartDate.getTime(), slotEndDate.getTime(), a.startsAt.getTime(), a.endsAt.getTime())
      );
      if (taken) continue;

      slots.push(formatMinutes(slotStart));
    }
  }

  return Array.from(new Set(slots)).sort();
}

function formatMinutes(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMinutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export async function isSlotAvailable(params: {
  organizationId: string;
  professionalId: string;
  serviceId: string;
  startsAt: Date;
  ignoreAppointmentId?: string;
}) {
  const { organizationId, professionalId, serviceId, startsAt, ignoreAppointmentId } = params;

  const service = await prisma.service.findFirst({ where: { id: serviceId, organizationId } });
  if (!service) return false;

  const endsAt = addMinutes(startsAt, service.durationMin);

  const [conflict, blocked] = await Promise.all([
    prisma.appointment.findFirst({
      where: {
        organizationId,
        professionalId,
        id: ignoreAppointmentId ? { not: ignoreAppointmentId } : undefined,
        status: { in: ACTIVE_STATUSES },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    }),
    prisma.blockedPeriod.findFirst({
      where: {
        organizationId,
        OR: [{ professionalId }, { professionalId: null }],
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    }),
  ]);

  return !conflict && !blocked;
}
