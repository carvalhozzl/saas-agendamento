import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth/context";
import {
  getWorkingHours,
  listBlockedPeriods,
  listActiveProfessionals,
} from "@/services/professionals/professional.service";
import { WorkingHoursEditor } from "@/components/professionals/working-hours-editor";
import { BlockedPeriodsSection } from "@/components/professionals/blocked-periods-section";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { HorariosScopeTabs } from "./scope-tabs";

export const metadata: Metadata = { title: "Horários" };

export default async function HorariosPage({
  searchParams,
}: {
  searchParams: Promise<{ profissional?: string }>;
}) {
  const { organizationId } = await requireOrgContext();
  const { profissional } = await searchParams;
  const scope = profissional || null;

  const [hours, blockedPeriods, professionals] = await Promise.all([
    getWorkingHours(organizationId, scope),
    listBlockedPeriods(organizationId),
    listActiveProfessionals(organizationId),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold text-foreground">Horários</h1>

      <Card>
        <CardHeader>
          <CardTitle>Horário de funcionamento</CardTitle>
          <CardDescription>
            Defina o horário padrão da empresa ou personalize por profissional.
          </CardDescription>
          <div className="pt-3">
            <HorariosScopeTabs professionals={professionals} selected={scope ?? ""} />
          </div>
        </CardHeader>
        <CardContent>
          <WorkingHoursEditor professionalId={scope} initialDays={hours} />
        </CardContent>
      </Card>

      <BlockedPeriodsSection blockedPeriods={blockedPeriods} professionals={professionals} />
    </div>
  );
}
