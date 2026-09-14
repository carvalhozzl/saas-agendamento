import { cn } from "@/lib/utils";
import type { AppointmentStatus } from "@prisma/client";

type Tone = "success" | "warning" | "danger" | "neutral" | "brand";

const toneClasses: Record<Tone, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  neutral: "bg-neutral-bg text-neutral",
  brand: "bg-brand/10 text-brand",
};

export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

const STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: "Aguardando confirmação",
  CONFIRMED: "Confirmado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  NO_SHOW: "Cliente faltou",
};

const STATUS_TONE: Record<AppointmentStatus, Tone> = {
  PENDING: "warning",
  CONFIRMED: "success",
  COMPLETED: "brand",
  CANCELLED: "danger",
  NO_SHOW: "neutral",
};

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{STATUS_LABEL[status]}</Badge>;
}

export { STATUS_LABEL as APPOINTMENT_STATUS_LABEL, STATUS_TONE as APPOINTMENT_STATUS_TONE };
