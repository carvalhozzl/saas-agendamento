import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { ClientInput } from "@/lib/validations/client";

export async function listClients(organizationId: string, search?: string) {
  return prisma.client.findMany({
    where: {
      organizationId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { whatsapp: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });
}

export async function getClientProfile(organizationId: string, clientId: string) {
  const client = await prisma.client.findFirst({
    where: { id: clientId, organizationId },
    include: {
      appointments: {
        include: { service: true, professional: true },
        orderBy: { startsAt: "desc" },
      },
    },
  });
  if (!client) return null;

  const completed = client.appointments.filter((a) => a.status === "COMPLETED");
  const now = new Date();
  const upcoming = client.appointments
    .filter((a) => a.startsAt > now && a.status !== "CANCELLED")
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())[0];
  const last = completed[0];
  const totalSpentCents = completed.reduce((sum, a) => sum + a.priceCents, 0);

  return {
    client,
    stats: {
      totalAppointments: completed.length,
      lastAppointment: last?.startsAt ?? null,
      nextAppointment: upcoming?.startsAt ?? null,
      totalSpentCents,
    },
  };
}

export async function createClient(organizationId: string, data: ClientInput) {
  return prisma.client.create({
    data: {
      organizationId,
      name: data.name,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      birthDate: data.birthDate ?? null,
      notes: data.notes || null,
    },
  });
}

export async function updateClient(organizationId: string, id: string, data: ClientInput) {
  const existing = await prisma.client.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Cliente não encontrado.");

  return prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      phone: data.phone || null,
      whatsapp: data.whatsapp || null,
      email: data.email || null,
      birthDate: data.birthDate ?? null,
      notes: data.notes || null,
    },
  });
}

export async function deleteClient(organizationId: string, id: string) {
  const existing = await prisma.client.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Cliente não encontrado.");
  return prisma.client.delete({ where: { id } });
}
