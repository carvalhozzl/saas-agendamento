import type { Metadata } from "next";
import { Check } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyCents, cn } from "@/lib/utils";
import { differenceInCalendarDays } from "date-fns";

export const metadata: Metadata = { title: "Assinatura" };

const STATUS_LABEL: Record<string, string> = {
  TRIALING: "Período de teste",
  ACTIVE: "Ativa",
  PAST_DUE: "Pagamento pendente",
  CANCELLED: "Cancelada",
};

export default async function AssinaturaPage() {
  const { organizationId } = await requireOrgContext(["OWNER"]);

  const [subscription, plans] = await Promise.all([
    prisma.subscription.findUnique({ where: { organizationId }, include: { plan: true } }),
    prisma.plan.findMany({ orderBy: { priceCents: "asc" } }),
  ]);

  const trialDaysLeft = subscription?.trialEndsAt
    ? Math.max(0, differenceInCalendarDays(subscription.trialEndsAt, new Date()))
    : null;

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold text-foreground">Assinatura</h1>

      {subscription && (
        <Card>
          <CardContent className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-sm text-muted">Plano atual</p>
              <p className="text-lg font-semibold text-foreground">{subscription.plan.name}</p>
            </div>
            <div className="flex items-center gap-3">
              {trialDaysLeft !== null && subscription.status === "TRIALING" && (
                <span className="text-sm text-muted">{trialDaysLeft} dias de teste restantes</span>
              )}
              <Badge tone={subscription.status === "ACTIVE" ? "success" : "warning"}>
                {STATUS_LABEL[subscription.status]}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const isCurrent = subscription?.planId === plan.id;
          const features = plan.features as string[];
          return (
            <Card key={plan.id} className={cn(isCurrent && "ring-2 ring-brand")}>
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-2xl font-semibold text-foreground mt-2">
                  {formatCurrencyCents(plan.priceCents)}
                  <span className="text-sm font-normal text-muted">/mês</span>
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled={isCurrent}
                  className={cn(
                    "w-full h-10 rounded-lg text-sm font-medium transition-colors",
                    isCurrent
                      ? "bg-muted-surface text-muted cursor-default"
                      : "bg-brand text-white hover:bg-brand-hover"
                  )}
                >
                  {isCurrent ? "Plano atual" : "Selecionar plano"}
                </button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted">
        A cobrança automática ainda não está ativa nesta versão. Ao integrar um gateway de pagamento, a troca de
        plano passará a atualizar sua assinatura automaticamente.
      </p>
    </div>
  );
}
