"use server";

import { revalidatePath } from "next/cache";
import { requireSuperAdmin } from "@/lib/auth/context";
import { prisma } from "@/lib/db/prisma";
import type { OrganizationStatus } from "@prisma/client";

export async function setOrganizationStatusAction(organizationId: string, status: OrganizationStatus) {
  await requireSuperAdmin();
  await prisma.organization.update({ where: { id: organizationId }, data: { status } });
  revalidatePath("/admin/empresas");
}
