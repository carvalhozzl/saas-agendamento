import Link from "next/link";
import { format, isSameMonth, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { WEEKDAY_SHORT } from "@/lib/segments";
import type { Appointment } from "@prisma/client";

export function MonthView({
  days,
  referenceDate,
  appointments,
}: {
  days: Date[];
  referenceDate: Date;
  appointments: Appointment[];
}) {
  return (
    <div>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAY_SHORT.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const count = appointments.filter(
            (a) => a.startsAt.toDateString() === day.toDateString()
          ).length;
          const inMonth = isSameMonth(day, referenceDate);

          return (
            <Link
              key={day.toISOString()}
              href={`/agenda?view=dia&data=${format(day, "yyyy-MM-dd")}`}
              className={cn(
                "aspect-square rounded-lg border border-border p-2 flex flex-col hover:border-brand transition-colors",
                !inMonth && "opacity-40",
                isToday(day) && "border-brand"
              )}
            >
              <span className="text-xs font-medium text-foreground">{format(day, "d")}</span>
              {count > 0 && (
                <span className="mt-auto text-[11px] font-medium text-brand bg-brand/10 rounded-full px-1.5 py-0.5 w-fit">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
