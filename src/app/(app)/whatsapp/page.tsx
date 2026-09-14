import type { Metadata } from "next";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { requireOrgContext } from "@/lib/auth/context";
import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { MessageCircle } from "lucide-react";
import { format } from "date-fns";

export const metadata: Metadata = { title: "WhatsApp" };

const TYPE_LABEL: Record<string, string> = {
  CONFIRMATION: "Confirmação",
  REMINDER: "Lembrete",
  CANCELLATION: "Cancelamento",
  RESCHEDULE: "Reagendamento",
};

export default async function WhatsAppPage() {
  const { organizationId } = await requireOrgContext();
  const configured = Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  const notifications = await prisma.notification.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-semibold text-foreground">WhatsApp</h1>

      <Card>
        <CardHeader>
          <CardTitle>Status da integração</CardTitle>
          <CardDescription>
            Confirmações e lembretes são enviados pela API Oficial do WhatsApp Business (Meta).
          </CardDescription>
        </CardHeader>
        <CardContent>
          {configured ? (
            <div className="flex items-center gap-2 text-success text-sm font-medium">
              <CheckCircle2 className="h-5 w-5" /> Conectado e pronto para enviar mensagens.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-warning text-sm font-medium">
                <AlertCircle className="h-5 w-5" /> Integração ainda não configurada.
              </div>
              <p className="text-sm text-muted">
                Configure as variáveis <code className="text-xs bg-muted-surface px-1 py-0.5 rounded">WHATSAPP_API_TOKEN</code>{" "}
                e <code className="text-xs bg-muted-surface px-1 py-0.5 rounded">WHATSAPP_PHONE_NUMBER_ID</code> nas
                configurações do servidor para ativar o envio real. Enquanto isso, as mensagens ficam registradas aqui
                sem serem enviadas.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Mensagens recentes</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <EmptyState icon={MessageCircle} title="Nenhuma mensagem enviada ainda." />
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((n) => (
                <li key={n.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {TYPE_LABEL[n.type]} · {n.recipientPhone}
                    </p>
                    <p className="text-xs text-muted truncate">{n.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge tone={n.status === "SENT" ? "success" : n.status === "FAILED" ? "danger" : "warning"}>
                      {n.status === "SENT" ? "Enviada" : n.status === "FAILED" ? "Falhou" : "Pendente"}
                    </Badge>
                    <p className="text-xs text-muted mt-1">{format(n.createdAt, "dd/MM HH:mm")}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
