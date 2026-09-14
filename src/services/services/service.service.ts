import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { ServiceInput } from "@/lib/validations/service";

export async function listServices(organizationId: string) {
  return prisma.service.findMany({
    where: { organizationId },
    include: { professionals: { include: { professional: true } } },
    orderBy: { name: "asc" },
  });
}

export async function listActiveServices(organizationId: string) {
  return prisma.service.findMany({
    where: { organizationId, status: "ACTIVE" },
    orderBy: { name: "asc" },
  });
}

export async function createService(organizationId: string, data: ServiceInput) {
  return prisma.service.create({
    data: {
      organizationId,
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      priceCents: data.priceCents,
      durationMin: data.durationMin,
      professionals: {
        create: data.professionalIds.map((professionalId) => ({ professionalId })),
      },
    },
  });
}

export async function updateService(organizationId: string, id: string, data: ServiceInput) {
  const existing = await prisma.service.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Serviço não encontrado.");

  return prisma.$transaction(async (tx) => {
    await tx.professionalService.deleteMany({ where: { serviceId: id } });
    return tx.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        priceCents: data.priceCents,
        durationMin: data.durationMin,
        professionals: {
          create: data.professionalIds.map((professionalId) => ({ professionalId })),
        },
      },
    });
  });
}

export async function toggleServiceStatus(organizationId: string, id: string) {
  const existing = await prisma.service.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Serviço não encontrado.");
  return prisma.service.update({
    where: { id },
    data: { status: existing.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
}

export async function deleteService(organizationId: string, id: string) {
  const existing = await prisma.service.findFirst({ where: { id, organizationId } });
  if (!existing) throw new Error("Serviço não encontrado.");
  return prisma.service.delete({ where: { id } });
}
