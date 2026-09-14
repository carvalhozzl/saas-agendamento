"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { formatCurrencyCents, formatDurationMin, cn } from "@/lib/utils";
import { getPublicAvailableSlotsAction, createPublicBookingAction } from "./actions";
import type { Professional, Service } from "@prisma/client";

type Step = "service" | "professional" | "datetime" | "info" | "done";

export function BookingWizard({
  organizationSlug,
  services,
  professionals,
  serviceProfessionalMap,
}: {
  organizationSlug: string;
  services: Service[];
  professionals: Professional[];
  serviceProfessionalMap: Record<string, string[]>;
}) {
  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState("");
  const [professionalId, setProfessionalId] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientWhatsapp, setClientWhatsapp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const selectedService = services.find((s) => s.id === serviceId);
  const selectedProfessional = professionals.find((p) => p.id === professionalId);

  const availableProfessionals = useMemo(() => {
    const ids = serviceProfessionalMap[serviceId] ?? [];
    return professionals.filter((p) => ids.includes(p.id));
  }, [serviceId, professionals, serviceProfessionalMap]);

  useEffect(() => {
    if (step !== "datetime" || !serviceId || !professionalId) return;
    let cancelled = false;
    (async () => {
      setLoadingSlots(true);
      setTime("");
      const result = await getPublicAvailableSlotsAction({ organizationSlug, professionalId, serviceId, date });
      if (cancelled) return;
      setSlots(result);
      setLoadingSlots(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [step, serviceId, professionalId, date, organizationSlug]);

  async function handleConfirm() {
    setError("");
    if (clientName.trim().length < 2) {
      setError("Informe seu nome.");
      return;
    }
    if (clientWhatsapp.trim().length < 8) {
      setError("Informe um WhatsApp válido.");
      return;
    }
    setIsSubmitting(true);
    try {
      await createPublicBookingAction({
        organizationSlug,
        serviceId,
        professionalId,
        date,
        time,
        clientName,
        clientWhatsapp,
      });
      setStep("done");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não foi possível concluir o agendamento.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-sm text-muted">
          Este estabelecimento ainda não disponibilizou serviços para agendamento online.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-5">
        <Stepper step={step} />

        {step === "service" && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Escolha o serviço</h2>
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setServiceId(s.id);
                  setProfessionalId("");
                  setStep("professional");
                }}
                className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 text-left hover:border-brand hover:bg-brand/5 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{s.name}</p>
                  <p className="text-xs text-muted">{formatDurationMin(s.durationMin)}</p>
                </div>
                <span className="text-sm font-semibold text-foreground">{formatCurrencyCents(s.priceCents)}</span>
              </button>
            ))}
          </div>
        )}

        {step === "professional" && (
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Escolha o profissional</h2>
            {availableProfessionals.length === 0 ? (
              <p className="text-sm text-muted">Nenhum profissional disponível para este serviço.</p>
            ) : (
              availableProfessionals.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setProfessionalId(p.id);
                    setStep("datetime");
                  }}
                  className="w-full flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-left hover:border-brand hover:bg-brand/5 transition-colors"
                >
                  <div className="h-9 w-9 rounded-full bg-brand/10 text-brand flex items-center justify-center font-semibold">
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <p className="text-sm font-medium text-foreground">{p.name}</p>
                </button>
              ))
            )}
            <BackButton onClick={() => setStep("service")} />
          </div>
        )}

        {step === "datetime" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Escolha a data e o horário</h2>
            <Label htmlFor="bookingDate">Data</Label>
            <Input
              id="bookingDate"
              type="date"
              value={date}
              min={format(new Date(), "yyyy-MM-dd")}
              onChange={(e) => setDate(e.target.value)}
            />
            {loadingSlots ? (
              <p className="text-sm text-muted">Carregando horários...</p>
            ) : slots.length === 0 ? (
              <p className="text-sm text-muted">Nenhum horário disponível nesta data.</p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {slots.map((s) => (
                  <button
                    key={s}
                    onClick={() => setTime(s)}
                    className={cn(
                      "h-10 rounded-lg border text-sm font-medium transition-colors",
                      time === s
                        ? "bg-brand text-white border-brand"
                        : "bg-surface text-foreground border-border hover:border-brand"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div className="flex justify-between pt-2">
              <BackButton onClick={() => setStep("professional")} />
              <Button disabled={!time} onClick={() => setStep("info")}>
                Continuar
              </Button>
            </div>
          </div>
        )}

        {step === "info" && (
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-foreground">Seus dados</h2>
            <div className="rounded-lg bg-muted-surface p-3 text-sm">
              <p className="font-medium text-foreground">{selectedService?.name}</p>
              <p className="text-muted">
                {selectedProfessional?.name} · {format(new Date(`${date}T00:00:00`), "dd/MM/yyyy")} às {time}
              </p>
            </div>
            <div>
              <Label htmlFor="clientName" required>
                Nome
              </Label>
              <Input id="clientName" value={clientName} onChange={(e) => setClientName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="clientWhatsapp" required>
                WhatsApp
              </Label>
              <Input
                id="clientWhatsapp"
                value={clientWhatsapp}
                onChange={(e) => setClientWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>
            <FieldError>{error}</FieldError>
            <div className="flex justify-between pt-2">
              <BackButton onClick={() => setStep("datetime")} />
              <Button onClick={handleConfirm} isLoading={isSubmitting}>
                Confirmar agendamento
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="text-center py-6 space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-success-bg flex items-center justify-center">
              <Check className="h-7 w-7 text-success" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Agendamento realizado com sucesso!</h2>
            <p className="text-sm text-muted">
              Você receberá uma confirmação pelo WhatsApp assim que o estabelecimento confirmar seu horário.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="text-sm text-muted hover:text-foreground font-medium">
      Voltar
    </button>
  );
}

const STEP_ORDER: Step[] = ["service", "professional", "datetime", "info"];
const STEP_LABELS: Record<Step, string> = {
  service: "Serviço",
  professional: "Profissional",
  datetime: "Data",
  info: "Dados",
  done: "Concluído",
};

function Stepper({ step }: { step: Step }) {
  if (step === "done") return null;
  const currentIndex = STEP_ORDER.indexOf(step);

  return (
    <div className="flex items-center gap-2">
      {STEP_ORDER.map((s, i) => (
        <div key={s} className="flex-1 flex items-center gap-2">
          <div
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i <= currentIndex ? "bg-brand" : "bg-muted-surface"
            )}
            title={STEP_LABELS[s]}
          />
        </div>
      ))}
    </div>
  );
}
