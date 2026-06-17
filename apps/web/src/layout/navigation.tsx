/* Itens de navegação do sistema — espelham os módulos de domínio do projeto.
   Centralizado aqui para a Sidebar e o roteamento (por estado) consumirem. */
import type { ComponentType } from 'react';
import {
  IconBadge,
  IconBell,
  IconCalendar,
  IconCard,
  IconChart,
  IconDashboard,
  IconDoor,
  IconDumbbell,
  IconMoney,
  IconUsers,
} from '../ui/icons';

export type NavKey =
  | 'dashboard'
  | 'alunos'
  | 'funcionarios'
  | 'planos'
  | 'financeiro'
  | 'treinos'
  | 'acesso'
  | 'agenda'
  | 'notificacoes'
  | 'relatorios';

export interface NavItem {
  key: NavKey;
  label: string;
  icon: ComponentType<{ size?: number }>;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: IconDashboard },
  { key: 'alunos', label: 'Alunos', icon: IconUsers },
  { key: 'funcionarios', label: 'Funcionários', icon: IconBadge },
  { key: 'planos', label: 'Planos', icon: IconCard },
  { key: 'financeiro', label: 'Financeiro', icon: IconMoney },
  { key: 'treinos', label: 'Treinos', icon: IconDumbbell },
  { key: 'acesso', label: 'Acesso', icon: IconDoor },
  { key: 'agenda', label: 'Agendamento', icon: IconCalendar },
  { key: 'notificacoes', label: 'Notificações', icon: IconBell },
  { key: 'relatorios', label: 'Relatórios', icon: IconChart },
];
