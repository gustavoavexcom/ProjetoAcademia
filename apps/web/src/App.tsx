import { useEffect, useState, type ComponentType } from 'react';
import AppShell from './layout/AppShell';
import type { ApiState } from './layout/Topbar';
import { NAV_ITEMS, type NavKey } from './layout/navigation';
import Dashboard from './pages/Dashboard';
import Placeholder from './pages/Placeholder';
import Alunos from './pages/Alunos';
import Funcionarios from './pages/Funcionarios';
import Exercicios from './pages/Exercicios';
import Planos from './pages/Planos';
import Financeiro from './pages/Financeiro';
import Fiscal from './pages/Fiscal';
import Treinos from './pages/Treinos';
import Avaliacao from './pages/Avaliacao';
import Acesso from './pages/Acesso';
import Agenda from './pages/Agenda';
import Notificacoes from './pages/Notificacoes';
import Login from './pages/Login';

// Mapa de roteamento por estado (sem react-router). Módulos sem página dedicada
// caem no Placeholder ("em construção").
const PAGINAS: Partial<Record<NavKey, ComponentType>> = {
  dashboard: Dashboard,
  alunos: Alunos,
  funcionarios: Funcionarios,
  exercicios: Exercicios,
  planos: Planos,
  financeiro: Financeiro,
  fiscal: Fiscal,
  treinos: Treinos,
  avaliacao: Avaliacao,
  acesso: Acesso,
  agenda: Agenda,
  notificacoes: Notificacoes,
};

interface HealthResponse {
  status: string;
  service: string;
  db?: 'up' | 'down';
  timestamp: string;
}

// Base URL da API: vazia em dev (usa o proxy do Vite); URL pública em produção.
const API_BASE = import.meta.env.VITE_API_URL ?? '';

export default function App() {
  const [active, setActive] = useState<NavKey>('dashboard');
  const [apiState, setApiState] = useState<ApiState>('loading');
  const [apiDetail, setApiDetail] = useState<string>();
  // Controle de acesso da recepção. Começa deslogado: exibe a tela de login.
  const [autenticado, setAutenticado] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/health`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((h: HealthResponse) => {
        setApiState('ok');
        const banco = h.db ? ` · banco ${h.db}` : '';
        setApiDetail(`${h.service}: ${h.status}${banco}`);
      })
      .catch((e: Error) => {
        setApiState('erro');
        setApiDetail(`API indisponível (${e.message}) — inicie o backend.`);
      });
  }, []);

  const current = NAV_ITEMS.find((i) => i.key === active);
  const title = current?.label ?? 'Dashboard';
  const Pagina = PAGINAS[active];

  // Tela trancada: exibe o login com o logo Pro Ativa até autenticar.
  if (!autenticado) {
    return <Login onLogin={() => setAutenticado(true)} />;
  }

  return (
    <AppShell
      active={active}
      title={title}
      apiState={apiState}
      apiDetail={apiDetail}
      onNavigate={setActive}
      onLogout={() => setAutenticado(false)}
    >
      {Pagina ? <Pagina /> : <Placeholder title={title} />}
    </AppShell>
  );
}
