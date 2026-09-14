"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/context";
import { z } from "zod";
import { workingHourSchema, blockedPeriodSchema } from "@/lib/validations/professional";
import {
  setWorkingHours,
  createBlockedPeriod,
  deleteBlockedPeriod,
} from "@/services/professionals/professional.service";

const weekSchema = z.array(workingHourSchema);

export async function saveWorkingHoursAction(professionalId: string | null, days: unknown) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  const parsed = weekSchema.parse(days);
  await setWorkingHours(organizationId, professionalId, parsed);
  revalidatePath("/horarios");
}

export async function createBlockedPeriodAction(input: unknown) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  const data = blockedPeriodSchema.parse(input);
  await createBlockedPeriod(organizationId, data);
  revalidatePath("/horarios");
  revalidatePath("/agenda");
}

export async function deleteBlockedPeriodAction(id: string) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  await deleteBlockedPeriod(organizationId, id);
  revalidatePath("/horarios");
  revalidatePath("/agenda");
}
