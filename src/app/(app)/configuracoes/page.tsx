import type { Metadata } from "next";
import { requireOrgContext } from "@/lib/auth/context";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "./profile-form";
import { SEGMENT_LABELS } from "@/lib/segments";

export const metadata: Metadata = { title: "Configurações" };

export default async function ConfiguracoesPage() {
  const { organizationId } = await requireOrgContext();
  const organization = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  const members = await prisma.membership.findMany({
    where: { organizationId },
    include: { user: true },
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Configurações</h1>

      <Card>
        <CardHeader>
          <CardTitle>Dados do negócio</CardTitle>
          <CardDescription>Segmento: {SEGMENT_LABELS[organization.segment]}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm organization={organization} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Equipe</CardTitle>
          <CardDescription>Pessoas com acesso a esta conta.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {members.map((m) => (
              <li key={m.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{m.user.name}</p>
                  <p className="text-xs text-muted">{m.user.email}</p>
                </div>
                <span className="text-xs font-medium text-muted bg-muted-surface rounded-full px-2.5 py-1">
                  {{ OWNER: "Dono", MANAGER: "Gerente", PROFESSIONAL: "Profissional" }[m.role]}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
