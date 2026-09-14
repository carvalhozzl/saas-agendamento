import Link from "next/link";
import { CalendarPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { AppointmentStatusBadge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Appointment, Client, Professional, Service } from "@prisma/client";

type AppointmentWithRelations = Appointment & {
  client: Client;
  professional: Professional;
  service: Service;
};

export function TodayAgenda({ appointments }: { appointments: AppointmentWithRelations[] }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Agenda de hoje</CardTitle>
        <Link href="/agenda" className="text-sm text-brand font-medium hover:underline">
          Ver agenda completa
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {appointments.length === 0 ? (
          <EmptyState
            icon={CalendarPlus}
            title="Você ainda não possui agendamentos hoje."
            description="Que tal criar o primeiro?"
            action={
              <Link
                href="/agendamentos?novo=1"
                className="inline-flex items-center h-9 px-4 rounded-lg bg-brand text-brand-foreground text-sm font-medium hover:bg-brand-hover"
              >
                + Criar agendamento
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-border">
            {appointments.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3.5">
                <div className="w-14 shrink-0 text-sm font-semibold text-foreground tabular-nums">
                  {format(a.startsAt, "HH:mm")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.client.name}</p>
                  <p className="text-xs text-muted truncate">
                    {a.service.name} · {a.professional.name}
                  </p>
                </div>
                <AppointmentStatusBadge status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
