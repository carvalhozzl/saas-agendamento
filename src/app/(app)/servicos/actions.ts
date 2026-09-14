"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/context";
import { serviceSchema, type ServiceInput } from "@/lib/validations/service";
import {
  createService,
  updateService,
  toggleServiceStatus,
  deleteService,
} from "@/services/services/service.service";

export async function createServiceAction(input: ServiceInput) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  const data = serviceSchema.parse(input);
  await createService(organizationId, data);
  revalidatePath("/servicos");
}

export async function updateServiceAction(id: string, input: ServiceInput) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  const data = serviceSchema.parse(input);
  await updateService(organizationId, id, data);
  revalidatePath("/servicos");
}

export async function toggleServiceStatusAction(id: string) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  await toggleServiceStatus(organizationId, id);
  revalidatePath("/servicos");
}

export async function deleteServiceAction(id: string) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  await deleteService(organizationId, id);
  revalidatePath("/servicos");
}
