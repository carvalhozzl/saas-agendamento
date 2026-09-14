"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/context";
import { professionalSchema, type ProfessionalInput } from "@/lib/validations/professional";
import {
  createProfessional,
  updateProfessional,
  toggleProfessionalStatus,
  deleteProfessional,
} from "@/services/professionals/professional.service";

export async function createProfessionalAction(input: ProfessionalInput) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  const data = professionalSchema.parse(input);
  await createProfessional(organizationId, data);
  revalidatePath("/profissionais");
}

export async function updateProfessionalAction(id: string, input: ProfessionalInput) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  const data = professionalSchema.parse(input);
  await updateProfessional(organizationId, id, data);
  revalidatePath("/profissionais");
}

export async function toggleProfessionalStatusAction(id: string) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  await toggleProfessionalStatus(organizationId, id);
  revalidatePath("/profissionais");
}

export async function deleteProfessionalAction(id: string) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  await deleteProfessional(organizationId, id);
  revalidatePath("/profissionais");
}
