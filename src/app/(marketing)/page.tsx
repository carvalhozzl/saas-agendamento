import Link from "next/link";
import {
  CalendarCheck2,
  MessageCircle,
  Users,
  BarChart3,
  Clock,
  ShieldCheck,
  Check,
} from "lucide-react";
import { prisma } from "@/lib/db/prisma";
import { formatCurrencyCents } from "@/lib/utils";

const BENEFITS = [
  {
    icon: CalendarCheck2,
    title: "Agenda sempre organizada",
    description: "Veja todos os horários do dia, da semana ou do mês em um único lugar, sem planilhas ou cadernos.",
  },
  {
    icon: MessageCircle,
    title: "Menos faltas com o WhatsApp",
    description: "Envie confirmações e lembretes automáticos e reduza o número de clientes que esquecem o horário.",
  },
  {
    icon: Users,
    title: "Clientes fazem o próprio agendamento",
    description: "Compartilhe sua página pública e deixe que os clientes escolham serviço, profissional e horário sozinhos.",
  },
  {
    icon: BarChart3,
    title: "Decisões com base em dados",
    description: "Acompanhe faturamento, serviços mais vendidos e profissionais com melhor desempenho.",
  },
];

const STEPS = [
  { title: "Crie sua conta", description: "Cadastre seu negócio em menos de 2 minutos, sem cartão de crédito." },
  { title: "Configure sua agenda", description: "Adicione serviços, profissionais e horários de funcionamento." },
  { title: "Compartilhe seu link", description: "Envie sua página de agendamento para os clientes agendarem sozinhos." },
];

const AUDIENCE = [
  "Barbearias",
  "Salões de beleza",
  "Clínicas de estética",
  "Manicures",
  "Lash designers",
  "Tatuadores",
  "Massagistas",
  "Personal trainers",
];

const FAQ = [
  {
    q: "Preciso instalar algum programa?",
    a: "Não. O AgendaPro funciona direto do navegador, no computador ou no celular.",
  },
  {
    q: "Meus clientes precisam criar uma conta para agendar?",
    a: "Não. Seus clientes agendam pela sua página pública informando apenas nome e WhatsApp.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, não há fidelidade. Você pode cancelar sua assinatura a qualquer momento.",
  },
  {
    q: "O envio de mensagens pelo WhatsApp é automático?",
    a: "Sim, quando a integração oficial do WhatsApp Business estiver configurada para sua conta.",
  },
];

export default async function LandingPage() {
  const plans = await prisma.plan.findMany({ orderBy: { priceCents: "asc" } });

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-20 text-center">
        <h1 className="text-3xl sm:text-5xl font-semibold text-foreground tracking-tight max-w-3xl mx-auto text-balance">
          Pare de perder clientes por falta de organização na agenda.
        </h1>
        <p className="text-lg text-muted mt-5 max-w-2xl mx-auto">
          Organize seus horários, clientes e atendimentos em um único lugar.
        </p>
        <div className="flex items-center justify-center gap-3 mt-8">
          <Link
            href="/registrar"
            className="inline-flex items-center h-12 px-6 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors shadow-sm shadow-brand/20"
          >
            Começar agora
          </Link>
          <a
            href="#recursos"
            className="inline-flex items-center h-12 px-6 rounded-xl border border-border font-medium text-foreground hover:bg-muted-surface transition-colors"
          >
            Ver recursos
          </a>
        </div>

        <div className="mt-14 rounded-2xl border border-border bg-surface shadow-xl max-w-3xl mx-auto overflow-hidden text-left">
          <div className="border-b border-border px-5 py-3 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-danger/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-muted">Bom dia, Carlos!</p>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Hoje", value: "12" },
                { label: "Confirmados", value: "9" },
                { label: "Pendentes", value: "3" },
                { label: "Faturamento", value: "R$ 840" },
              ].map((s) => (
                <div key={s.label} className="rounded-lg bg-muted-surface p-3">
                  <p className="text-[11px] text-muted">{s.label}</p>
                  <p className="text-lg font-semibold text-foreground">{s.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-border divide-y divide-border">
              {[
                { time: "09:00", name: "João Silva", service: "Corte Masculino" },
                { time: "10:30", name: "Mariana Souza", service: "Escova" },
              ].map((a) => (
                <div key={a.time} className="flex items-center gap-3 px-4 py-3">
                  <span className="text-sm font-semibold text-foreground w-12">{a.time}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.name}</p>
                    <p className="text-xs text-muted">{a.service}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="recursos" className="bg-surface border-y border-border py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground text-center">
            Tudo que o seu negócio precisa para agendar melhor
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {BENEFITS.map((b) => (
              <div key={b.title} className="text-center">
                <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-4">
                  <b.icon className="h-6 w-6" />
                </div>
                <h3 className="text-base font-semibold text-foreground">{b.title}</h3>
                <p className="text-sm text-muted mt-2">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground text-center">Como funciona</h2>
          <div className="grid sm:grid-cols-3 gap-8 mt-12">
            {STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="h-10 w-10 rounded-full bg-brand text-white font-semibold flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="text-sm text-muted mt-2">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface border-y border-border py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">Para quem é o AgendaPro</h2>
          <p className="text-sm text-muted mt-3">Feito para negócios de serviços que vivem de agenda cheia.</p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {AUDIENCE.map((a) => (
              <span key={a} className="px-4 py-2 rounded-full bg-muted-surface text-sm font-medium text-foreground">
                {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground text-center">Planos para todo tamanho de negócio</h2>
          <p className="text-sm text-muted text-center mt-3">14 dias grátis em qualquer plano, sem cartão de crédito.</p>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            {plans.map((plan) => (
              <div key={plan.id} className="rounded-2xl border border-border bg-surface p-6 flex flex-col">
                <h3 className="text-base font-semibold text-foreground">{plan.name}</h3>
                <p className="text-3xl font-semibold text-foreground mt-3">
                  {formatCurrencyCents(plan.priceCents)}
                  <span className="text-sm font-normal text-muted">/mês</span>
                </p>
                <ul className="space-y-2 mt-5 flex-1">
                  {(plan.features as string[]).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-success shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/registrar"
                  className="mt-6 inline-flex items-center justify-center h-10 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
                >
                  Começar agora
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-surface border-y border-border py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground text-center">Perguntas frequentes</h2>
          <div className="mt-10 divide-y divide-border">
            {FAQ.map((f) => (
              <details key={f.q} className="py-4 group">
                <summary className="cursor-pointer text-sm font-medium text-foreground list-none flex items-center justify-between">
                  {f.q}
                  <span className="text-muted group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-muted mt-2">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <div className="h-12 w-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center mx-auto mb-5">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
            Organize sua agenda, reduza faltas e facilite o agendamento dos seus clientes.
          </h2>
          <Link
            href="/registrar"
            className="mt-8 inline-flex items-center h-12 px-6 rounded-xl bg-brand text-white font-medium hover:bg-brand-hover transition-colors"
          >
            <Clock className="h-4 w-4 mr-2" /> Criar minha conta grátis
          </Link>
        </div>
      </section>
    </>
  );
}
