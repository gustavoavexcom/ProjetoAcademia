import { useEffect, useState } from 'react';
import { StatusMensalidade } from '@academia/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { Field, SelectField } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface AlunoMin {
  id: string;
  nome: string;
  planoId?: string | null;
}

interface MensalidadeRow {
  id: string;
  competencia: string;
  valor: string;
  vencimento: string;
  status: StatusMensalidade;
  pagoEm?: string | null;
  aluno?: { nome: string };
  plano?: { nome: string };
}

const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

const BADGE: Record<StatusMensalidade, string> = {
  PENDENTE: 'badge--orange',
  PAGA: 'badge--green',
  VENCIDA: 'badge--red',
  CANCELADA: 'badge',
};

type Aba = 'todas' | 'inadimplentes';

export default function Financeiro() {
  const [alunos, setAlunos] = useState<AlunoMin[]>([]);
  const [mensalidades, setMensalidades] = useState<MensalidadeRow[]>([]);
  const [aba, setAba] = useState<Aba>('todas');
  const [alunoId, setAlunoId] = useState('');
  const [competencia, setCompetencia] = useState('');
  const [diaVencimento, setDiaVencimento] = useState('10');
  const [erro, setErro] = useState<string>();
  const [gerando, setGerando] = useState(false);

  async function carregar(abaAtual: Aba = aba) {
    try {
      const rota = abaAtual === 'inadimplentes' ? '/mensalidades/inadimplentes' : '/mensalidades';
      const [m, a] = await Promise.all([
        apiGet<MensalidadeRow[]>(rota),
        apiGet<AlunoMin[]>('/alunos'),
      ]);
      setMensalidades(m);
      setAlunos(a);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function trocarAba(nova: Aba) {
    setAba(nova);
    carregar(nova);
  }

  async function gerar() {
    setGerando(true);
    setErro(undefined);
    try {
      await apiPost('/mensalidades/gerar', {
        alunoId,
        competencia,
        diaVencimento: Number(diaVencimento),
      });
      setAlunoId('');
      setCompetencia('');
      await carregar('todas');
      setAba('todas');
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setGerando(false);
    }
  }

  async function pagar(id: string) {
    try {
      await apiPatch(`/mensalidades/${id}/pagar`);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta mensalidade?')) return;
    try {
      await apiDelete(`/mensalidades/${id}`);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const colunas: Column<MensalidadeRow>[] = [
    { header: 'Aluno', render: (m) => m.aluno?.nome ?? '—' },
    { header: 'Plano', render: (m) => m.plano?.nome ?? '—' },
    { header: 'Competência', render: (m) => m.competencia },
    { header: 'Valor', render: (m) => moeda(Number(m.valor)) },
    { header: 'Vencimento', render: (m) => data(m.vencimento) },
    {
      header: 'Status',
      render: (m) => <span className={`badge ${BADGE[m.status]}`}>{m.status}</span>,
    },
    {
      header: 'Ações',
      render: (m) => (
        <div className="crud__actions">
          {m.status !== 'PAGA' && (
            <Button variant="secondary" size="sm" onClick={() => pagar(m.id)}>
              Registrar pagamento
            </Button>
          )}
          <Button variant="danger" size="sm" onClick={() => excluir(m.id)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="crud">
      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Gerar mensalidade</h2>
          <span className="crud__hint">Usa o plano vinculado ao aluno</span>
        </div>
        {erro && <div className="alert alert--error">{erro}</div>}
        <div className="crud__form-grid">
          <SelectField
            label="Aluno"
            value={alunoId}
            onChange={(e) => setAlunoId(e.target.value)}
          >
            <option value="">— selecione —</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </SelectField>
          <Field
            label="Competência (AAAA-MM)"
            placeholder="2026-06"
            value={competencia}
            onChange={(e) => setCompetencia(e.target.value)}
          />
          <Field
            label="Dia de vencimento"
            type="number"
            min="1"
            max="28"
            value={diaVencimento}
            onChange={(e) => setDiaVencimento(e.target.value)}
          />
        </div>
        <div className="crud__actions">
          <Button onClick={gerar} disabled={gerando || !alunoId || !competencia}>
            {gerando ? 'Gerando…' : 'Gerar mensalidade'}
          </Button>
        </div>
      </section>

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Mensalidades</h2>
          <span className="crud__hint">{mensalidades.length} registro(s)</span>
        </div>
        <div className="tabs">
          <button
            className={`tabs__btn${aba === 'todas' ? ' is-active' : ''}`}
            onClick={() => trocarAba('todas')}
          >
            Todas
          </button>
          <button
            className={`tabs__btn${aba === 'inadimplentes' ? ' is-active' : ''}`}
            onClick={() => trocarAba('inadimplentes')}
          >
            Inadimplentes
          </button>
        </div>
        <DataTable
          columns={colunas}
          rows={mensalidades}
          empty="Nenhuma mensalidade encontrada."
        />
      </section>
    </div>
  );
}
