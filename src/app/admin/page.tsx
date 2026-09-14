import type { Metadata } from "next";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrencyCents } from "@/lib/utils";
import { startOfMonth } from "date-fns";

export const metadata: Metadata = { title: "Admin · Visão geral" };

export default async function AdminDashboardPage() {
  const [totalOrgs, activeOrgs, trialOrgs, newThisMonth, activeSubscriptions] = await Promise.all([
    prisma.organization.count(),
    prisma.organization.count({ where: { status: "ACTIVE" } }),
    prisma.organization.count({ where: { status: "TRIAL" } }),
    prisma.organization.count({ where: { createdAt: { gte: startOfMonth(new Date()) } } }),
    prisma.subscription.findMany({ where: { status: "ACTIVE" }, include: { plan: true } }),
  ]);

  const monthlyRevenueCents = activeSubscriptions.reduce((sum, s) => sum + s.plan.priceCents, 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <h1 className="text-2xl font-semibold text-foreground">Visão geral da plataforma</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Empresas cadastradas" value={totalOrgs} />
        <Metric label="Empresas ativas" value={activeOrgs} />
        <Metric label="Em período de teste" value={trialOrgs} />
        <Metric label="Novos cadastros (mês)" value={newThisMonth} />
      </div>

      <Card>
        <CardContent>
          <p className="text-xs text-muted">Receita mensal recorrente (assinaturas ativas)</p>
          <p className="text-2xl font-semibold text-foreground mt-1">{formatCurrencyCents(monthlyRevenueCents)}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
  );
}
