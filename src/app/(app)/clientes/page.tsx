import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth/context";
import { listClients } from "@/services/clients/client.service";
import { ClientsClient } from "./clients-client";

export const metadata: Metadata = { title: "Clientes" };

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ busca?: string }>;
}) {
  const { organizationId } = await requireOrgContext();
  const { busca } = await searchParams;
  const clients = await listClients(organizationId, busca);

  return <ClientsClient clients={clients} search={busca ?? ""} />;
}
