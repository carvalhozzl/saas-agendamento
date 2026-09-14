import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "brand" | "success" | "warning" | "danger" | "neutral";
}) {
  const toneClasses = {
    brand: "bg-brand/10 text-brand",
    success: "bg-success-bg text-success",
    warning: "bg-warning-bg text-warning",
    danger: "bg-danger-bg text-danger",
    neutral: "bg-neutral-bg text-neutral",
  }[tone];

  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", toneClasses)}>
          <Icon className="h-5 w-5" strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted">{label}</p>
          <p className="text-xl font-semibold text-foreground truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
