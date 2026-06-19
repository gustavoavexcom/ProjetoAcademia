import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Topbar, { type ApiState } from './Topbar';
import type { NavKey } from './navigation';
import './AppShell.css';

interface AppShellProps {
  active: NavKey;
  title: string;
  apiState: ApiState;
  apiDetail?: string;
  onNavigate: (key: NavKey) => void;
  onLogout: () => void;
  children: ReactNode;
}

export default function AppShell({
  active,
  title,
  apiState,
  apiDetail,
  onNavigate,
  onLogout,
  children,
}: AppShellProps) {
  return (
    <div className="shell">
      <Sidebar active={active} onNavigate={onNavigate} />
      <div className="shell__main">
        <Topbar title={title} apiState={apiState} apiDetail={apiDetail} onLogout={onLogout} />
        <main className="shell__content">{children}</main>
      </div>
    </div>
  );
}
