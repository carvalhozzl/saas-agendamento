import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth/context";
import { listServices } from "@/services/services/service.service";
import { listActiveProfessionals } from "@/services/professionals/professional.service";
import { ServicesClient } from "./services-client";

export const metadata: Metadata = { title: "Serviços" };

export default async function ServicosPage() {
  const { organizationId } = await requireOrgContext();
  const [services, professionals] = await Promise.all([
    listServices(organizationId),
    listActiveProfessionals(organizationId),
  ]);

  return <ServicesClient services={services} professionals={professionals} />;
}
