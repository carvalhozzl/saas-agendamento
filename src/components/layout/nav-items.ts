import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Users,
  UserRound,
  Scissors,
  Clock,
  BarChart3,
  Link2,
  MessageCircle,
  CreditCard,
  Settings,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/agendamentos", label: "Agendamentos", icon: ClipboardList },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/profissionais", label: "Profissionais", icon: UserRound },
  { href: "/servicos", label: "Serviços", icon: Scissors },
  { href: "/horarios", label: "Horários", icon: Clock },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/pagina-agendamento", label: "Página de agendamento", icon: Link2 },
  { href: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
  { href: "/assinatura", label: "Assinatura", icon: CreditCard },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export const MOBILE_NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Início", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/configuracoes", label: "Ajustes", icon: Settings },
];
