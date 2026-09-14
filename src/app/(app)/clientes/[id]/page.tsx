import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { getClientProfile } from "@/services/clients/client.service";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentStatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatCurrencyCents } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarX } from "lucide-react";

export const metadata: Metadata = { title: "Cliente" };

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { organizationId } = await requireOrgContext();
  const { id } = await params;
  const profile = await getClientProfile(organizationId, id);
  if (!profile) notFound();

  const { client, stats } = profile;

  return (
    <div className="space-y-6 max-w-3xl">
      <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Voltar para clientes
      </Link>

      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xl font-semibold shrink-0">
          {client.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
          <p className="text-sm text-muted">{client.whatsapp || client.phone || "Sem contato cadastrado"}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent>
            <p className="text-xs text-muted">Total de atendimentos</p>
            <p className="text-xl font-semibold text-foreground">{stats.totalAppointments}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted">Último atendimento</p>
            <p className="text-xl font-semibold text-foreground">
              {stats.lastAppointment ? format(stats.lastAppointment, "dd/MM/yyyy") : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted">Próximo atendimento</p>
            <p className="text-xl font-semibold text-foreground">
              {stats.nextAppointment ? format(stats.nextAppointment, "dd/MM/yyyy") : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-xs text-muted">Total gasto</p>
            <p className="text-xl font-semibold text-foreground">{formatCurrencyCents(stats.totalSpentCents)}</p>
          </CardContent>
        </Card>
      </div>

      {client.notes && (
        <Card>
          <CardContent>
            <p className="text-xs text-muted mb-1">Observações</p>
            <p className="text-sm text-foreground">{client.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="p-5 border-b border-border">
            <h2 className="text-base font-semibold text-foreground">Histórico de agendamentos</h2>
          </div>
          {client.appointments.length === 0 ? (
            <EmptyState icon={CalendarX} title="Nenhum agendamento até o momento." />
          ) : (
            <ul className="divide-y divide-border">
              {client.appointments.map((a) => (
                <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-24 shrink-0 text-sm text-foreground">
                    {format(a.startsAt, "dd/MM/yyyy")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{a.service.name}</p>
                    <p className="text-xs text-muted truncate">{a.professional.name}</p>
                  </div>
                  <AppointmentStatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
