import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CopyLinkButton } from "./copy-link-button";

export const metadata: Metadata = { title: "Página de agendamento" };

export default async function PaginaAgendamentoPage() {
  const { organizationId } = await requireOrgContext();
  const organization = await prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const publicUrl = `${baseUrl}/agendar/${organization.slug}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">Página de agendamento</h1>

      <Card>
        <CardHeader>
          <CardTitle>Seu link público</CardTitle>
          <CardDescription>
            Compartilhe este link com seus clientes para que eles agendem sozinhos, sem precisar de login.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted-surface px-3 py-2.5 text-sm font-mono text-foreground overflow-x-auto">
            {publicUrl}
          </div>
          <div className="flex gap-2">
            <CopyLinkButton url={publicUrl} />
            <Link
              href={publicUrl}
              target="_blank"
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg border border-border text-sm font-medium hover:bg-muted-surface"
            >
              <ExternalLink className="h-4 w-4" /> Visualizar página
            </Link>
          </div>
          <p className="text-xs text-muted">
            Para editar nome, descrição e contato exibidos nessa página, acesse{" "}
            <Link href="/configuracoes" className="text-brand hover:underline">
              Configurações
            </Link>
            .
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
