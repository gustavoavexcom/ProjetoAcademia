import { IconDoor, IconSearch } from '../ui/icons';
import './Topbar.css';

export type ApiState = 'loading' | 'ok' | 'erro';

interface TopbarProps {
  title: string;
  apiState: ApiState;
  apiDetail?: string;
  onLogout: () => void;
}

const STATUS_LABEL: Record<ApiState, string> = {
  loading: 'Verificando API…',
  ok: 'API online',
  erro: 'API indisponível',
};

export default function Topbar({ title, apiState, apiDetail, onLogout }: TopbarProps) {
  return (
    <header className="topbar">
      <h1 className="topbar__title">{title}</h1>

      <div className="topbar__search">
        <IconSearch size={18} />
        <input type="search" placeholder="Buscar aluno, plano, nota…" aria-label="Buscar" />
      </div>

      <div className="topbar__right">
        <span
          className={`topbar__status topbar__status--${apiState}`}
          title={apiDetail ?? STATUS_LABEL[apiState]}
        >
          <span className="topbar__dot" />
          {STATUS_LABEL[apiState]}
        </span>

        <div className="topbar__user" title="Recepção / Administração">
          <span className="topbar__avatar">RA</span>
          <span className="topbar__user-name">Recepção</span>
        </div>

        <button
          type="button"
          className="topbar__logout"
          onClick={onLogout}
          title="Fechar sessão e voltar ao login"
        >
          <IconDoor size={18} />
          <span className="topbar__logout-text">Sair</span>
        </button>
      </div>
    </header>
  );
}
