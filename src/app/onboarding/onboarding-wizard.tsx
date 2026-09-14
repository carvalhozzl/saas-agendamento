"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { SEGMENT_LABELS, WEEKDAY_LABELS } from "@/lib/segments";
import type { BusinessSegment } from "@prisma/client";
import {
  saveSegmentStep,
  saveFirstServiceStep,
  saveWorkingHoursStep,
  saveFirstProfessionalStep,
  finishOnboarding,
} from "./actions";

type WeekDayForm = { weekday: number; enabled: boolean; startTime: string; endTime: string };

const TOTAL_STEPS = 4;

export function OnboardingWizard({
  businessName,
  initialHours,
}: {
  businessName: string;
  initialHours: WeekDayForm[];
}) {
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [segment, setSegment] = useState<BusinessSegment>("OTHER");
  const [hours, setHours] = useState<WeekDayForm[]>(initialHours);

  function next() {
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function handleError(error: unknown) {
    toast.error(error instanceof Error ? error.message : "Algo deu errado.");
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="mb-8">
        <div className="flex justify-between text-xs text-muted mb-2">
          <span>Configuração inicial</span>
          <span>
            {Math.min(step, TOTAL_STEPS)} de {TOTAL_STEPS} concluído
          </span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted-surface overflow-hidden">
          <div
            className="h-full bg-brand transition-all"
            style={{ width: `${(Math.min(step, TOTAL_STEPS) / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Qual o segmento de {businessName}?</h1>
          <p className="text-sm text-muted">Isso nos ajuda a personalizar sua experiência.</p>
          <Select value={segment} onChange={(e) => setSegment(e.target.value as BusinessSegment)}>
            {Object.entries(SEGMENT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Button
            className="w-full"
            isLoading={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await saveSegmentStep(segment);
                  next();
                } catch (e) {
                  handleError(e);
                }
              })
            }
          >
            Continuar
          </Button>
        </div>
      )}

      {step === 1 && (
        <form
          className="space-y-4"
          action={(formData) =>
            startTransition(async () => {
              try {
                await saveFirstServiceStep(formData);
                next();
              } catch (e) {
                handleError(e);
              }
            })
          }
        >
          <h1 className="text-xl font-semibold text-foreground">Cadastre seu primeiro serviço</h1>
          <p className="text-sm text-muted">Você poderá adicionar mais serviços depois.</p>
          <div>
            <Label htmlFor="name" required>
              Nome do serviço
            </Label>
            <Input id="name" name="name" placeholder="Corte Masculino" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="price" required>
                Preço (R$)
              </Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" placeholder="45,00" required />
            </div>
            <div>
              <Label htmlFor="durationMin" required>
                Duração (min)
              </Label>
              <Input id="durationMin" name="durationMin" type="number" min="5" step="5" placeholder="40" required />
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={isPending}>
            Continuar
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h1 className="text-xl font-semibold text-foreground">Defina seu horário de funcionamento</h1>
          <p className="text-sm text-muted">Já preenchemos com um horário padrão. Ajuste se precisar.</p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {hours.map((day, i) => (
              <div key={day.weekday} className="flex items-center gap-2">
                <label className="flex items-center gap-2 w-28 shrink-0 text-sm">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => {
                      const copy = [...hours];
                      copy[i] = { ...day, enabled: e.target.checked };
                      setHours(copy);
                    }}
                  />
                  {WEEKDAY_LABELS[day.weekday]}
                </label>
                <Input
                  type="time"
                  value={day.startTime}
                  disabled={!day.enabled}
                  onChange={(e) => {
                    const copy = [...hours];
                    copy[i] = { ...day, startTime: e.target.value };
                    setHours(copy);
                  }}
                  className="h-9"
                />
                <span className="text-muted text-sm">até</span>
                <Input
                  type="time"
                  value={day.endTime}
                  disabled={!day.enabled}
                  onChange={(e) => {
                    const copy = [...hours];
                    copy[i] = { ...day, endTime: e.target.value };
                    setHours(copy);
                  }}
                  className="h-9"
                />
              </div>
            ))}
          </div>
          <Button
            className="w-full"
            isLoading={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await saveWorkingHoursStep(hours);
                  next();
                } catch (e) {
                  handleError(e);
                }
              })
            }
          >
            Continuar
          </Button>
        </div>
      )}

      {step === 3 && (
        <form
          className="space-y-4"
          action={(formData) =>
            startTransition(async () => {
              try {
                await saveFirstProfessionalStep(formData);
                next();
              } catch (e) {
                handleError(e);
              }
            })
          }
        >
          <h1 className="text-xl font-semibold text-foreground">Cadastre seu primeiro profissional</h1>
          <p className="text-sm text-muted">Pode ser você mesmo(a).</p>
          <div>
            <Label htmlFor="pname" required>
              Nome
            </Label>
            <Input id="pname" name="name" placeholder="Carlos Souza" required />
          </div>
          <div>
            <Label htmlFor="pphone">Telefone</Label>
            <Input id="pphone" name="phone" placeholder="(11) 99999-9999" />
          </div>
          <Button type="submit" className="w-full" isLoading={isPending}>
            Continuar
          </Button>
        </form>
      )}

      {step === 4 && (
        <div className="text-center space-y-4 py-6">
          <div className="mx-auto h-14 w-14 rounded-full bg-success-bg flex items-center justify-center text-2xl">
            🎉
          </div>
          <h1 className="text-xl font-semibold text-foreground">Sua agenda está pronta!</h1>
          <p className="text-sm text-muted">
            Agora é só começar a receber e organizar seus agendamentos.
          </p>
          <Button
            className="w-full"
            isLoading={isPending}
            onClick={() =>
              startTransition(async () => {
                try {
                  await finishOnboarding();
                  router.push("/dashboard");
                } catch (e) {
                  handleError(e);
                }
              })
            }
          >
            Ir para o dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
