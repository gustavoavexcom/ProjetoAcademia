import { IconArrowDown, IconArrowUp } from '../ui/icons';
import './Dashboard.css';

/* Dados ilustrativos — substituir por chamadas à API conforme os módulos
   (Aluno, Financeiro, Acesso) forem expostos. */
interface Metric {
  label: string;
  value: string;
  delta: number;
  hint: string;
  accent: 'blue' | 'orange' | 'green' | 'red';
}

const METRICS: Metric[] = [
  { label: 'Alunos ativos', value: '342', delta: 4.2, hint: 'vs. mês anterior', accent: 'blue' },
  { label: 'Check-ins hoje', value: '128', delta: 12.5, hint: 'vs. ontem', accent: 'orange' },
  { label: 'Receita do mês', value: 'R$ 48.250', delta: 6.8, hint: 'vs. mês anterior', accent: 'green' },
  { label: 'Inadimplentes', value: '17', delta: -8.0, hint: 'vs. mês anterior', accent: 'red' },
];

const RECENT = [
  { nome: 'Mariana Lopes', acao: 'Novo cadastro', plano: 'Mensal', quando: 'há 5 min' },
  { nome: 'Carlos Eduardo', acao: 'Pagamento', plano: 'Trimestral', quando: 'há 22 min' },
  { nome: 'Fernanda Dias', acao: 'Check-in', plano: 'Anual', quando: 'há 38 min' },
  { nome: 'Roberto Alves', acao: 'Renovação', plano: 'Mensal', quando: 'há 1 h' },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <section className="metrics">
        {METRICS.map((m) => (
          <article key={m.label} className={`metric metric--${m.accent}`}>
            <span className="metric__label">{m.label}</span>
            <strong className="metric__value">{m.value}</strong>
            <span className={`metric__delta${m.delta < 0 ? ' is-down' : ''}`}>
              {m.delta < 0 ? <IconArrowDown size={14} /> : <IconArrowUp size={14} />}
              {Math.abs(m.delta).toFixed(1)}%<small>{m.hint}</small>
            </span>
          </article>
        ))}
      </section>

      <div className="dashboard__grid">
        <section className="panel">
          <header className="panel__head">
            <h2>Frequência da semana</h2>
            <span className="panel__hint">check-ins por dia</span>
          </header>
          <div className="chart">
            {[62, 78, 71, 90, 84, 110, 48].map((v, i) => (
              <div className="chart__col" key={i}>
                <div className="chart__bar" style={{ height: `${(v / 110) * 100}%` }} />
                <span>{['S', 'T', 'Q', 'Q', 'S', 'S', 'D'][i]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <header className="panel__head">
            <h2>Atividade recente</h2>
          </header>
          <ul className="activity">
            {RECENT.map((r, i) => (
              <li key={i} className="activity__item">
                <span className="activity__avatar">
                  {r.nome.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
                <div className="activity__body">
                  <strong>{r.nome}</strong>
                  <span>
                    {r.acao} · {r.plano}
                  </span>
                </div>
                <time>{r.quando}</time>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
