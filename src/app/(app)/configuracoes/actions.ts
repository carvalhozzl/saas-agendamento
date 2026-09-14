"use server";

import { revalidatePath } from "next/cache";
import { requireOrgContext } from "@/lib/auth/context";
import { updateOrganizationProfile } from "@/services/organizations/organization.service";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().trim().min(2),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(20).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function updateProfileAction(formData: FormData) {
  const { organizationId } = await requireOrgContext(["OWNER"]);
  const parsed = profileSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    phone: formData.get("phone"),
    whatsapp: formData.get("whatsapp"),
    address: formData.get("address"),
  });
  await updateOrganizationProfile(organizationId, parsed);
  revalidatePath("/configuracoes");
  revalidatePath("/pagina-agendamento");
}
