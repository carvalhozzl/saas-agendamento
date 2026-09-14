import "server-only";
import { prisma } from "@/lib/db/prisma";
import { startOfDay, endOfDay } from "date-fns";
import type { Prisma } from "@prisma/client";

type AppointmentWithRelations = Prisma.AppointmentGetPayload<{
  include: { client: true; service: true; professional: true };
}>;

const SLOT_MIN = 30;
const DEFAULT_START = "08:00";
const DEFAULT_END = "20:00";

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function toTime(minutes: number) {
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, "0");
  const m = (minutes % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

export type AgendaSlotCell =
  | { type: "closed" }
  | { type: "blocked"; reason?: string }
  | { type: "free" }
  | { type: "appointment"; isStart: boolean; appointmentId: string };

export interface AgendaColumn {
  professionalId: string;
  professionalName: string;
  cells: AgendaSlotCell[];
}

export interface AgendaGrid {
  times: string[];
  columns: AgendaColumn[];
  appointmentsById: Record<string, AppointmentWithRelations>;
}

export async function getDayAgendaGrid({
  organizationId,
  date,
  professionalIds,
}: {
  organizationId: string;
  date: Date;
  professionalIds: string[];
}): Promise<AgendaGrid> {
  const weekday = date.getDay();

  const [professionals, orgHours, allProHours, blockedPeriods, appointments] = await Promise.all([
    prisma.professional.findMany({
      where: { organizationId, status: "ACTIVE", ...(professionalIds.length ? { id: { in: professionalIds } } : {}) },
      orderBy: { name: "asc" },
    }),
    prisma.workingHour.findMany({ where: { organizationId, professionalId: null, weekday } }),
    prisma.workingHour.findMany({ where: { organizationId, professionalId: { not: null }, weekday } }),
    prisma.blockedPeriod.findMany({
      where: {
        organizationId,
        startsAt: { lt: endOfDay(date) },
        endsAt: { gt: startOfDay(date) },
      },
    }),
    prisma.appointment.findMany({
      where: {
        organizationId,
        startsAt: { gte: startOfDay(date), lte: endOfDay(date) },
        status: { not: "CANCELLED" },
        ...(professionalIds.length ? { professionalId: { in: professionalIds } } : {}),
      },
      include: { client: true, service: true, professional: true },
    }),
  ]);

  let rangeStart = toMinutes(DEFAULT_START);
  let rangeEnd = toMinutes(DEFAULT_END);
  const allHours = [...orgHours, ...allProHours];
  if (allHours.length > 0) {
    rangeStart = Math.min(...allHours.map((h) => toMinutes(h.startTime)));
    rangeEnd = Math.max(...allHours.map((h) => toMinutes(h.endTime)));
  }

  const times: string[] = [];
  for (let t = rangeStart; t < rangeEnd; t += SLOT_MIN) times.push(toTime(t));

  const appointmentsById: AgendaGrid["appointmentsById"] = {};
  for (const a of appointments) appointmentsById[a.id] = a;

  const columns: AgendaColumn[] = professionals.map((prof) => {
    const proHours = allProHours.filter((h) => h.professionalId === prof.id);
    const hours = proHours.length > 0 ? proHours : orgHours;

    const cells: AgendaSlotCell[] = times.map((time) => {
      const slotStart = toMinutes(time);
      const slotEnd = slotStart + SLOT_MIN;

      const withinHours = hours.some((h) => {
        const hs = toMinutes(h.startTime);
        const he = toMinutes(h.endTime);
        const inBreak =
          h.breakStart && h.breakEnd && slotStart < toMinutes(h.breakEnd) && slotEnd > toMinutes(h.breakStart);
        return slotStart >= hs && slotEnd <= he && !inBreak;
      });

      if (!withinHours) return { type: "closed" };

      const slotDate = new Date(date);
      slotDate.setHours(0, slotStart, 0, 0);
      const slotEndDate = new Date(date);
      slotEndDate.setHours(0, slotEnd, 0, 0);

      const block = blockedPeriods.find(
        (b) =>
          (b.professionalId === prof.id || b.professionalId === null) &&
          slotDate < b.endsAt &&
          slotEndDate > b.startsAt
      );
      if (block) return { type: "blocked", reason: block.note ?? undefined };

      const appointment = appointments.find(
        (a) => a.professionalId === prof.id && slotDate < a.endsAt && slotEndDate > a.startsAt
      );
      if (appointment) {
        return { type: "appointment", isStart: appointment.startsAt.getTime() === slotDate.getTime(), appointmentId: appointment.id };
      }

      return { type: "free" };
    });

    return { professionalId: prof.id, professionalName: prof.name, cells };
  });

  return { times, columns, appointmentsById };
}
