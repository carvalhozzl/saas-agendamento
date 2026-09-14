import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth/context";
import { listAppointments } from "@/services/appointments/appointment.service";
import { listClients } from "@/services/clients/client.service";
import { listActiveServices } from "@/services/services/service.service";
import { listActiveProfessionals } from "@/services/professionals/professional.service";
import { AgendamentosClient } from "./agendamentos-client";
import type { AppointmentStatus } from "@prisma/client";

export const metadata: Metadata = { title: "Agendamentos" };

export default async function AgendamentosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { organizationId } = await requireOrgContext();
  const { status } = await searchParams;

  const [appointments, clients, services, professionals] = await Promise.all([
    listAppointments({
      organizationId,
      status: status ? (status as AppointmentStatus) : undefined,
    }),
    listClients(organizationId),
    listActiveServices(organizationId),
    listActiveProfessionals(organizationId),
  ]);

  return (
    <AgendamentosClient
      appointments={appointments}
      clients={clients}
      services={services}
      professionals={professionals}
      currentStatus={status ?? ""}
    />
  );
}
