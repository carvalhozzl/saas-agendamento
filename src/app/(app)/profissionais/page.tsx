import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth/context";
import { listProfessionals } from "@/services/professionals/professional.service";
import { listActiveServices } from "@/services/services/service.service";
import { ProfessionalsClient } from "./professionals-client";

export const metadata: Metadata = { title: "Profissionais" };

export default async function ProfissionaisPage() {
  const { organizationId } = await requireOrgContext();
  const [professionals, services] = await Promise.all([
    listProfessionals(organizationId),
    listActiveServices(organizationId),
  ]);

  return <ProfessionalsClient professionals={professionals} services={services} />;
}
