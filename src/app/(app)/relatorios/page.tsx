import type { Metadata } from "next";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { requireOrgContext } from "@/lib/auth/context";
import { getReportData } from "@/services/reports/report.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrencyCents } from "@/lib/utils";
import { PeriodFilter } from "./period-filter";
import { AppointmentsChart } from "./appointments-chart";

export const metadata: Metadata = { title: "Relatórios" };

function getRange(period: string) {
  const now = new Date();
  if (period === "semana") return { from: startOfWeek(now), to: endOfWeek(now) };
  if (period === "mes") return { from: startOfMonth(now), to: endOfMonth(now) };
  return { from: startOfDay(now), to: endOfDay(now) };
}

export default async function RelatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ periodo?: string }>;
}) {
  const { organizationId } = await requireOrgContext();
  const { periodo = "mes" } = await searchParams;
  const { from, to } = getRange(periodo);
  const report = await getReportData(organizationId, from, to);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold text-foreground">Relatórios</h1>
        <PeriodFilter current={periodo} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total de agendamentos" value={report.total} />
        <SummaryCard label="Concluídos" value={report.completed} />
        <SummaryCard label="Cancelamentos / faltas" value={report.cancelled + report.noShow} />
        <SummaryCard label="Faturamento" value={formatCurrencyCents(report.revenueCents)} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Agendamentos no período</CardTitle>
        </CardHeader>
        <CardContent>
          <AppointmentsChart data={report.byDay} />
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Serviços mais vendidos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.topServices.length === 0 && <p className="text-sm text-muted">Sem dados no período.</p>}
            {report.topServices.map((s) => (
              <RankRow key={s.name} label={s.name} value={s.count} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profissionais com mais atendimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.topProfessionals.length === 0 && <p className="text-sm text-muted">Sem dados no período.</p>}
            {report.topProfessionals.map((p) => (
              <RankRow key={p.name} label={p.name} value={p.count} />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard label="Clientes recorrentes" value={report.recurringClients} />
        <SummaryCard label="Novos clientes" value={report.newClients} />
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}

function RankRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-foreground">{label}</span>
      <span className="text-muted font-medium">{value}</span>
    </div>
  );
}
