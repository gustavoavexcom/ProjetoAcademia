import logo from '../assets/logo.png';
import { NAV_ITEMS, type NavKey } from './navigation';
import './Sidebar.css';

interface SidebarProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
}

export default function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src={logo} alt="Pro Ativa Gutha" className="sidebar__logo" />
        <div className="sidebar__brand-text">
          <strong>Pro Ativa</strong>
          <span>Gestão</span>
        </div>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            className={`sidebar__item${active === key ? ' is-active' : ''}`}
            onClick={() => onNavigate(key)}
            aria-current={active === key ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <footer className="sidebar__footer">
        <p>v0.1.0 · Sistema de Academia</p>
      </footer>
    </aside>
  );
}
