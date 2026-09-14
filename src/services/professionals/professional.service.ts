import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { ProfessionalInput, WorkingHourInput, BlockedPeriodInput } from "@/lib/validations/professional";

export async function listProfessionals(organizationId: string) {
  return prisma.professional.findMany({
    where: { organizationId },
    include: { services: { include: { service: true } } },
    orderBy: { name: "asc" },
  });
}

export async function listActiveProfessionals(organizationId: string, serviceId?: string) {
  return prisma.professional.findMany({
    where: {
      organizationId,
      status: "ACTIVE",
      ...(serviceId ? { services: { some: { serviceId } } } : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function createProfessional(organizationId: string, data: ProfessionalInput) {
  return prisma.professional.create({
    data: {
      organizationId,
      name: data.name,
      phone: data.phone || null,
      email: data.email || null,
      bio: data.bio || null,
      services: { create: data.serviceIds.map((serviceId) => ({ serviceId })) },
    },
  });
}

export async function updateProfessional(organizationId: string, id: string, data: ProfessionalInput) {
  const existing = await prisma.professional.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Profissional não encontrado.");

  return prisma.$transaction(async (tx) => {
    await tx.professionalService.deleteMany({ where: { professionalId: id } });
    return tx.professional.update({
      where: { id },
      data: {
        name: data.name,
        phone: data.phone || null,
        email: data.email || null,
        bio: data.bio || null,
        services: { create: data.serviceIds.map((serviceId) => ({ serviceId })) },
      },
    });
  });
}

export async function toggleProfessionalStatus(organizationId: string, id: string) {
  const existing = await prisma.professional.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Profissional não encontrado.");
  return prisma.professional.update({
    where: { id },
    data: { status: existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
}

export async function deleteProfessional(organizationId: string, id: string) {
  const existing = await prisma.professional.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Profissional não encontrado.");
  return prisma.professional.delete({ where: { id } });
}

const WEEKDAYS = [0, 1, 2, 3, 4, 5, 6];

export async function getWorkingHours(organizationId: string, professionalId: string | null) {
  const hours = await prisma.workingHour.findMany({
    where: { organizationId, professionalId },
    orderBy: { weekday: "asc" },
  });
  return WEEKDAYS.map((weekday) => {
    const existing = hours.find((h) => h.weekday === weekday);
    return existing
      ? { ...existing, enabled: true }
      : {
          id: null,
          weekday,
          enabled: false,
          startTime: "09:00",
          endTime: "18:00",
          breakStart: null,
          breakEnd: null,
        };
  });
}

export async function setWorkingHours(
  organizationId: string,
  professionalId: string | null,
  days: WorkingHourInput[]
) {
  return prisma.$transaction(async (tx) => {
    await tx.workingHour.deleteMany({ where: { organizationId, professionalId } });
    const enabledDays = days.filter((d) => d.enabled);
    if (enabledDays.length === 0) return [];
    return tx.workingHour.createMany({
      data: enabledDays.map((d) => ({
        organizationId,
        professionalId,
        weekday: d.weekday,
        startTime: d.startTime,
        endTime: d.endTime,
        breakStart: d.breakStart || null,
        breakEnd: d.breakEnd || null,
      })),
    });
  });
}

export async function listBlockedPeriods(organizationId: string) {
  return prisma.blockedPeriod.findMany({
    where: { organizationId },
    include: { professional: true },
    orderBy: { startsAt: "desc" },
  });
}

export async function createBlockedPeriod(organizationId: string, data: BlockedPeriodInput) {
  return prisma.blockedPeriod.create({
    data: {
      organizationId,
      professionalId: data.professionalId || null,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      reason: data.reason,
      note: data.note || null,
    },
  });
}

export async function deleteBlockedPeriod(organizationId: string, id: string) {
  const existing = await prisma.blockedPeriod.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Bloqueio não encontrado.");
  return prisma.blockedPeriod.delete({ where: { id } });
}
