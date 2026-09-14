import type { Metadata } from "next";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  eachDayOfInterval,
} from "date-fns";
import { requireOrgContext } from "@/lib/auth/context";
import { getDayAgendaGrid } from "@/services/appointments/agenda-grid";
import { listAppointmentsInRange } from "@/services/appointments/appointment.service";
import { listClients } from "@/services/clients/client.service";
import { listActiveServices } from "@/services/services/service.service";
import { listActiveProfessionals, listProfessionals } from "@/services/professionals/professional.service";
import { AgendaToolbar } from "./agenda-toolbar";
import { DayGrid } from "./day-grid";
import { WeekView } from "./week-view";
import { MonthView } from "./month-view";

export const metadata: Metadata = { title: "Agenda" };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ data?: string; view?: string; profissional?: string }>;
}) {
  const { organizationId } = await requireOrgContext();
  const { data, view = "dia", profissional = "" } = await searchParams;

  const referenceDate = data ? new Date(`${data}T00:00:00`) : new Date();
  const dateStr = referenceDate.toISOString().slice(0, 10);

  const [allProfessionals, activeProfessionals, clients, services] = await Promise.all([
    listProfessionals(organizationId),
    listActiveProfessionals(organizationId),
    listClients(organizationId),
    listActiveServices(organizationId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Agenda</h1>
      </div>

      <AgendaToolbar
        date={dateStr}
        view={view}
        professionals={allProfessionals}
        selectedProfessionalId={profissional}
      />

      {view === "dia" && (
        <DayViewContainer
          organizationId={organizationId}
          date={referenceDate}
          dateStr={dateStr}
          professionalId={profissional}
          clients={clients}
          services={services}
          professionals={activeProfessionals}
        />
      )}

      {view === "semana" && (
        <WeekViewContainer organizationId={organizationId} date={referenceDate} professionalId={profissional} />
      )}

      {view === "mes" && (
        <MonthViewContainer organizationId={organizationId} date={referenceDate} professionalId={profissional} />
      )}
    </div>
  );
}

async function DayViewContainer({
  organizationId,
  date,
  dateStr,
  professionalId,
  clients,
  services,
  professionals,
}: {
  organizationId: string;
  date: Date;
  dateStr: string;
  professionalId: string;
  clients: Awaited<ReturnType<typeof listClients>>;
  services: Awaited<ReturnType<typeof listActiveServices>>;
  professionals: Awaited<ReturnType<typeof listActiveProfessionals>>;
}) {
  const grid = await getDayAgendaGrid({
    organizationId,
    date,
    professionalIds: professionalId ? [professionalId] : [],
  });

  return <DayGrid grid={grid} date={dateStr} clients={clients} services={services} professionals={professionals} />;
}

async function WeekViewContainer({
  organizationId,
  date,
  professionalId,
}: {
  organizationId: string;
  date: Date;
  professionalId: string;
}) {
  const from = startOfWeek(date);
  const to = endOfWeek(date);
  const days = eachDayOfInterval({ start: from, end: to });
  const appointments = await listAppointmentsInRange({
    organizationId,
    from: startOfDay(from),
    to: endOfDay(to),
    professionalId: professionalId || undefined,
  });

  return <WeekView days={days} appointments={appointments} />;
}

async function MonthViewContainer({
  organizationId,
  date,
  professionalId,
}: {
  organizationId: string;
  date: Date;
  professionalId: string;
}) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const from = startOfWeek(monthStart);
  const to = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: from, end: to });
  const appointments = await listAppointmentsInRange({
    organizationId,
    from: startOfDay(from),
    to: endOfDay(to),
    professionalId: professionalId || undefined,
  });

  return <MonthView days={days} referenceDate={date} appointments={appointments} />;
}
