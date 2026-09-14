import type { Metadata } from "next";
import { CalendarCheck2, Clock3, XCircle, Wallet } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { getTodayStats, listAppointmentsInRange } from "@/services/appointments/appointment.service";
import { StatCard } from "@/components/dashboard/stat-card";
import { TodayAgenda } from "@/components/dashboard/today-agenda";
import { formatCurrencyCents } from "@/lib/utils";
import { auth } from "@/lib/auth/auth";
import { startOfDay, endOfDay } from "date-fns";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const { organizationId } = await requireOrgContext();
  const session = await auth();
  const firstName = session?.user?.name?.split(" ")[0] ?? "";

  const [stats, todayAppointments] = await Promise.all([
    getTodayStats(organizationId),
    listAppointmentsInRange({
      organizationId,
      from: startOfDay(new Date()),
      to: endOfDay(new Date()),
    }),
  ]);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Bom dia, {firstName}!</h1>
        <p className="text-sm text-muted mt-1">Aqui está o resumo do seu dia.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Agendamentos hoje" value={stats.total} icon={CalendarCheck2} tone="brand" />
        <StatCard label="Pendentes" value={stats.pending} icon={Clock3} tone="warning" />
        <StatCard label="Cancelados / faltas" value={stats.cancelled} icon={XCircle} tone="danger" />
        <StatCard
          label="Faturamento previsto"
          value={formatCurrencyCents(stats.expectedRevenueCents)}
          icon={Wallet}
          tone="success"
        />
      </div>

      <TodayAgenda appointments={todayAppointments} />
    </div>
  );
}
