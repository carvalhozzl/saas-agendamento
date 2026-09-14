"use server";

import { requireOrgContext } from "@/lib/auth/context";
import {
  updateOrganizationProfile,
  completeOnboardingStep,
} from "@/services/organizations/organization.service";
import { createService, listActiveServices } from "@/services/services/service.service";
import { createProfessional, setWorkingHours } from "@/services/professionals/professional.service";
import { serviceSchema } from "@/lib/validations/service";
import { professionalSchema, workingHourSchema } from "@/lib/validations/professional";
import type { BusinessSegment } from "@prisma/client";
import { z } from "zod";

export async function saveSegmentStep(segment: BusinessSegment) {
  const { organizationId } = await requireOrgContext(["OWNER"]);
  await updateOrganizationProfile(organizationId, { segment });
  await completeOnboardingStep(organizationId, 1);
}

export async function saveFirstServiceStep(formData: FormData) {
  const { organizationId } = await requireOrgContext(["OWNER"]);
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    priceCents: Math.round(Number(formData.get("price")) * 100),
    durationMin: formData.get("durationMin"),
    professionalIds: [],
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");

  await createService(organizationId, parsed.data);
  await completeOnboardingStep(organizationId, 2);
}

const weekSchema = z.array(workingHourSchema);

export async function saveWorkingHoursStep(days: z.infer<typeof weekSchema>) {
  const { organizationId } = await requireOrgContext(["OWNER"]);
  const parsed = weekSchema.parse(days);
  await setWorkingHours(organizationId, null, parsed);
  await completeOnboardingStep(organizationId, 3);
}

export async function saveFirstProfessionalStep(formData: FormData) {
  const { organizationId } = await requireOrgContext(["OWNER"]);

  // The onboarding wizard only ever creates one service before this step,
  // so the first professional is assumed to perform it — otherwise the
  // public booking page would have no professional to offer for it.
  const existingServices = await listActiveServices(organizationId);

  const parsed = professionalSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") ?? "",
    serviceIds: existingServices.map((s) => s.id),
  });
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Dados inválidos");

  await createProfessional(organizationId, parsed.data);
  await completeOnboardingStep(organizationId, 4);
}

export async function finishOnboarding() {
  const { organizationId } = await requireOrgContext(["OWNER"]);
  await completeOnboardingStep(organizationId, 5);
}
