"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { setOrganizationStatusAction } from "./actions";
import type { Organization, Subscription, Plan } from "@prisma/client";

type OrgRow = Organization & { subscription: (Subscription & { plan: Plan }) | null };

const STATUS_TONE = {
  TRIAL: "warning",
  ACTIVE: "success",
  SUSPENDED: "danger",
  CANCELLED: "neutral",
} as const;

const STATUS_LABEL: Record<string, string> = {
  TRIAL: "Teste",
  ACTIVE: "Ativa",
  SUSPENDED: "Bloqueada",
  CANCELLED: "Cancelada",
};

export function EmpresasTable({ organizations }: { organizations: OrgRow[] }) {
  const [isPending, startTransition] = useTransition();

  function toggle(org: OrgRow) {
    const nextStatus = org.status === "SUSPENDED" ? "ACTIVE" : "SUSPENDED";
    startTransition(async () => {
      await setOrganizationStatusAction(org.id, nextStatus);
      toast.success(nextStatus === "SUSPENDED" ? "Empresa bloqueada." : "Empresa reativada.");
    });
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-muted">
            <th className="px-4 py-3 font-medium">Empresa</th>
            <th className="px-4 py-3 font-medium">Plano</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Cadastro</th>
            <th className="px-4 py-3 font-medium text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {organizations.map((org) => (
            <tr key={org.id} className="border-b border-border last:border-0">
              <td className="px-4 py-3">
                <p className="font-medium text-foreground">{org.name}</p>
                <p className="text-xs text-muted">/{org.slug}</p>
              </td>
              <td className="px-4 py-3 text-foreground">{org.subscription?.plan.name ?? "—"}</td>
              <td className="px-4 py-3">
                <Badge tone={STATUS_TONE[org.status]}>{STATUS_LABEL[org.status]}</Badge>
              </td>
              <td className="px-4 py-3 text-muted">{format(org.createdAt, "dd/MM/yyyy")}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => toggle(org)}
                  disabled={isPending}
                  className="text-xs font-medium text-brand hover:underline disabled:opacity-50"
                >
                  {org.status === "SUSPENDED" ? "Reativar" : "Bloquear"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
