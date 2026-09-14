import Link from "next/link";
import { format, isSameDay } from "date-fns";
import { AppointmentStatusBadge } from "@/components/ui/badge";
import { WEEKDAY_SHORT } from "@/lib/segments";
import type { Appointment, Client, Professional, Service } from "@prisma/client";

type AppointmentWithRelations = Appointment & { client: Client; professional: Professional; service: Service };

export function WeekView({ days, appointments }: { days: Date[]; appointments: AppointmentWithRelations[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
      {days.map((day) => {
        const dayAppointments = appointments
          .filter((a) => isSameDay(a.startsAt, day))
          .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

        return (
          <div key={day.toISOString()} className="rounded-lg border border-border bg-surface min-h-[10rem]">
            <div className="px-3 py-2 border-b border-border">
              <p className="text-xs text-muted">{WEEKDAY_SHORT[day.getDay()]}</p>
              <p className="text-sm font-semibold text-foreground">{format(day, "dd/MM")}</p>
            </div>
            <div className="p-2 space-y-1.5">
              {dayAppointments.length === 0 ? (
                <p className="text-xs text-muted px-1 py-2">Sem agendamentos</p>
              ) : (
                dayAppointments.map((a) => (
                  <Link
                    key={a.id}
                    href={`/agenda?view=dia&data=${format(day, "yyyy-MM-dd")}`}
                    className="block rounded-md bg-brand/10 hover:bg-brand/20 px-2 py-1.5 text-xs transition-colors"
                  >
                    <p className="font-medium text-brand">
                      {format(a.startsAt, "HH:mm")} · {a.client.name}
                    </p>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-muted truncate">{a.service.name}</span>
                      <AppointmentStatusBadge status={a.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
