import "server-only";
import { prisma } from "@/lib/db/prisma";
import { format, eachDayOfInterval } from "date-fns";

export async function getReportData(organizationId: string, from: Date, to: Date) {
  const appointments = await prisma.appointment.findMany({
    where: { organizationId, startsAt: { gte: from, lte: to } },
    include: { client: true, professional: true, service: true },
  });

  const completed = appointments.filter((a) => a.status === "COMPLETED");
  const cancelled = appointments.filter((a) => a.status === "CANCELLED");
  const noShow = appointments.filter((a) => a.status === "NO_SHOW");
  const revenueCents = completed.reduce((sum, a) => sum + a.priceCents, 0);

  const byDay = eachDayOfInterval({ start: from, end: to }).map((day) => {
    const key = format(day, "dd/MM");
    const count = appointments.filter((a) => format(a.startsAt, "dd/MM") === key).length;
    return { date: key, agendamentos: count };
  });

  const serviceCounts = new Map<string, { name: string; count: number }>();
  for (const a of appointments) {
    const entry = serviceCounts.get(a.serviceId) ?? { name: a.service.name, count: 0 };
    entry.count += 1;
    serviceCounts.set(a.serviceId, entry);
  }
  const topServices = Array.from(serviceCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const professionalCounts = new Map<string, { name: string; count: number }>();
  for (const a of appointments) {
    const entry = professionalCounts.get(a.professionalId) ?? { name: a.professional.name, count: 0 };
    entry.count += 1;
    professionalCounts.set(a.professionalId, entry);
  }
  const topProfessionals = Array.from(professionalCounts.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const clientAppointmentCounts = new Map<string, number>();
  for (const a of appointments) {
    clientAppointmentCounts.set(a.clientId, (clientAppointmentCounts.get(a.clientId) ?? 0) + 1);
  }
  const recurringClients = Array.from(clientAppointmentCounts.values()).filter((c) => c > 1).length;

  const newClients = await prisma.client.count({
    where: { organizationId, createdAt: { gte: from, lte: to } },
  });

  return {
    total: appointments.length,
    completed: completed.length,
    cancelled: cancelled.length,
    noShow: noShow.length,
    revenueCents,
    byDay,
    topServices,
    topProfessionals,
    recurringClients,
    newClients,
  };
}
