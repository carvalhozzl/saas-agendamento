import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { EmpresasTable } from "./empresas-table";

export const metadata: Metadata = { title: "Admin · Empresas" };

export default async function AdminEmpresasPage() {
  const organizations = await prisma.organization.findMany({
    include: { subscription: { include: { plan: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-foreground">Empresas</h1>
      <EmpresasTable organizations={organizations} />
    </div>
  );
}
