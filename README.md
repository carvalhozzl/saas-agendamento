# AgendaPro

> Sua agenda organizada. Seus clientes lembrados. Seu negócio crescendo.

SaaS multi-tenant de agendamento online para barbearias, salões, clínicas de estética, personal trainers e outros prestadores de serviço.

## Stack

- **Next.js 16 (App Router) + React 19 + TypeScript** — frontend e backend no mesmo projeto (Server Components, Server Actions e Route Handlers).
- **Tailwind CSS v4** — design system utilitário.
- **PostgreSQL + Prisma** — banco relacional, migrations versionadas.
- **Auth.js (NextAuth v5)** — sessão via JWT, credenciais com senha (bcrypt).
- **Zod + React Hook Form** — validação e formulários.
- **Recharts** — gráficos do dashboard e relatórios.

## Arquitetura

```
prisma/
  schema.prisma        modelo de dados (multi-tenant)
  seed.ts               planos + super admin de desenvolvimento

src/
  app/
    (marketing)/         landing page comercial
    (auth)/               login e cadastro
    (app)/                painel autenticado (sidebar + topbar), uma pasta por módulo
    onboarding/           wizard de configuração inicial (fora do shell autenticado)
    agendar/[slug]/       página pública de agendamento (sem login)
    admin/                painel do Super Admin da plataforma
    api/auth/             rota do NextAuth

  components/
    ui/                   primitivos (Button, Input, Modal, Badge, EmptyState...)
    layout/               Sidebar, Topbar, navegação mobile
    dashboard/, appointments/, clients/, professionals/, services/

  lib/
    auth/                 config do NextAuth + guarda de contexto multi-tenant
    db/                   client Prisma (singleton)
    validations/          schemas Zod por entidade
    whatsapp/             adapter da WhatsApp Business Cloud API (+ fallback no-op)

  services/               regras de negócio (camada entre rotas e Prisma)
    appointments/         disponibilidade, conflito de horário, CRUD
    clients/, professionals/, services/, notifications/, organizations/, reports/
```

### Multi-tenancy

Toda tabela de negócio carrega `organizationId`. O único ponto de entrada para dados de um tenant é `requireOrgContext()` (`src/lib/auth/context.ts`): ele resolve a sessão, confirma o vínculo (`Membership`) do usuário com a organização e devolve o `organizationId` — que nunca vem do cliente. Nenhuma query usa um `organizationId` vindo diretamente de input do usuário.

### Papéis

`SUPER_ADMIN` (plataforma, fora de qualquer organização) e, por organização, `OWNER` / `MANAGER` / `PROFESSIONAL` (tabela `Membership`). Ações sensíveis exigem papel mínimo, verificado no servidor (`requireOrgContext(["OWNER", "MANAGER"])`).

### Motor de agendamento

`src/services/appointments/availability.ts` calcula horários livres cruzando: duração do serviço, horário de funcionamento (padrão da empresa ou por profissional), intervalos de almoço, bloqueios (`BlockedPeriod`) e agendamentos existentes. A criação (`appointment.service.ts`) revalida o conflito dentro de uma transação para fechar a corrida entre a checagem e a escrita.

## Rodando localmente

```bash
cp .env.example .env
# ajuste DATABASE_URL se necessário

npm install
npx prisma migrate dev
npm run db:seed   # cria os planos e um super admin (admin@agendapro.com / admin12345)
npm run dev
```

WhatsApp: sem `WHATSAPP_API_TOKEN`/`WHATSAPP_PHONE_NUMBER_ID` configurados, as mensagens ficam registradas em `Notification` mas não são enviadas de verdade — não há integração alternativa/não-oficial.

## Scripts

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`
- `npm run db:seed`
