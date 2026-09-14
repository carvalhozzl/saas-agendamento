import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = { title: "Configuração inicial" };

const DEFAULT_WEEK = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  enabled: weekday >= 1 && weekday <= 6,
  startTime: weekday === 6 ? "08:00" : "08:00",
  endTime: weekday === 6 ? "14:00" : "18:00",
}));

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const organizationId = session.user.activeOrganizationId;
  if (!organizationId) redirect("/login");

  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { workingHours: { where: { professionalId: null } } },
  });
  if (!organization) redirect("/login");
  if (organization.onboardingDone) redirect("/dashboard");

  const initialHours = DEFAULT_WEEK.map((d) => {
    const existing = organization.workingHours.find((h) => h.weekday === d.weekday);
    return existing
      ? { weekday: d.weekday, enabled: true, startTime: existing.startTime, endTime: existing.endTime }
      : d;
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted-surface px-4 py-12">
      <OnboardingWizard businessName={organization.name} initialHours={initialHours} />
    </div>
  );
}
