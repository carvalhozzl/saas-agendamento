"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/context";
import { clientSchema, type ClientInput } from "@/lib/validations/client";
import { createClient, updateClient, deleteClient } from "@/services/clients/client.service";

export async function createClientAction(input: ClientInput) {
  const { organizationId } = await requireOrgContext();
  const data = clientSchema.parse(input);
  await createClient(organizationId, data);
  revalidatePath("/clientes");
}

export async function updateClientAction(id: string, input: ClientInput) {
  const { organizationId } = await requireOrgContext();
  const data = clientSchema.parse(input);
  await updateClient(organizationId, id, data);
  revalidatePath("/clientes");
  revalidatePath(`/clientes/${id}`);
}

export async function deleteClientAction(id: string) {
  const { organizationId } = await requireOrgContext(["OWNER", "MANAGER"]);
  await deleteClient(organizationId, id);
  revalidatePath("/clientes");
}
