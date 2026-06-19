import { useEffect, useState } from 'react';
import type { PainelAvisos } from '@academia/shared';
import { apiGet } from '../api/client';
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

const PAINEL_VAZIO: PainelAvisos = { notificacoes: [], avisos: [] };

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

export default function Dashboard() {
  const [painel, setPainel] = useState<PainelAvisos>(PAINEL_VAZIO);

  useEffect(() => {
    // Painel é informativo: em caso de falha, mantém o estado vazio sem quebrar a tela.
    apiGet<PainelAvisos>('/notificacoes/painel')
      .then(setPainel)
      .catch(() => setPainel(PAINEL_VAZIO));
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard__main">
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

      {/* Lado direito da tela — avisos e notificações (MOD-10/MOD-04). */}
      <aside className="rail">
        <section className="panel">
          <header className="panel__head">
            <h2>Notificações</h2>
            <span className="panel__hint">{painel.notificacoes.length}</span>
          </header>
          {painel.notificacoes.length === 0 ? (
            <p className="rail__empty">Nenhuma notificação no momento.</p>
          ) : (
            <ul className="rail__list">
              {painel.notificacoes.map((n) => (
                <li key={n.id} className="aviso aviso--info">
                  <div className="aviso__topo">
                    <strong>{n.titulo}</strong>
                    <span className="badge badge--blue">{n.tipo}</span>
                  </div>
                  <span className="aviso__msg">{n.mensagem}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel">
          <header className="panel__head">
            <h2>Avisos de vencimento</h2>
            <span className="panel__hint">planos e mensalidades</span>
          </header>
          {painel.avisos.length === 0 ? (
            <p className="rail__empty">Nenhum vencimento próximo.</p>
          ) : (
            <ul className="rail__list">
              {painel.avisos.map((a) => (
                <li key={a.id} className={`aviso aviso--${a.cor}`}>
                  <div className="aviso__topo">
                    <strong>{a.aluno}</strong>
                    <span className={`badge ${a.cor === 'verde' ? 'badge--green' : 'badge--red'}`}>
                      {a.categoria === 'PLANO' ? 'Plano' : 'Mensalidade'}
                    </span>
                  </div>
                  <span className="aviso__msg">{a.descricao}</span>
                  <time className="aviso__data">venc. {dataCurta(a.data)}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </aside>
    </div>
  );
}
