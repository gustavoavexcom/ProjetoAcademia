import { useEffect, useState } from 'react';
import { StatusNota } from '@academia/shared';
import { apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { Field, SelectField } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface AlunoMin {
  id: string;
  nome: string;
}

interface NotaRow {
  id: string;
  numero: string;
  protocolo: string;
  valor: string;
  descricaoServico: string;
  status: StatusNota;
  emitidaEm: string;
  aluno?: { nome: string };
}

const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

export default function Fiscal() {
  const [alunos, setAlunos] = useState<AlunoMin[]>([]);
  const [notas, setNotas] = useState<NotaRow[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState<string>();
  const [emitindo, setEmitindo] = useState(false);

  async function carregar() {
    try {
      const [n, a] = await Promise.all([
        apiGet<NotaRow[]>('/notas'),
        apiGet<AlunoMin[]>('/alunos'),
      ]);
      setNotas(n);
      setAlunos(a);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function emitir() {
    setEmitindo(true);
    setErro(undefined);
    try {
      await apiPost('/notas/emitir', {
        alunoId,
        valor: Number(valor),
        descricaoServico: descricao || undefined,
      });
      setAlunoId('');
      setValor('');
      setDescricao('');
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setEmitindo(false);
    }
  }

  async function cancelar(id: string) {
    if (!confirm('Cancelar esta nota fiscal?')) return;
    try {
      await apiPatch(`/notas/${id}/cancelar`);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const colunas: Column<NotaRow>[] = [
    { header: 'Número', render: (n) => n.numero },
    { header: 'Aluno', render: (n) => n.aluno?.nome ?? '—' },
    { header: 'Serviço', render: (n) => n.descricaoServico },
    { header: 'Valor', render: (n) => moeda(Number(n.valor)) },
    { header: 'Emitida em', render: (n) => data(n.emitidaEm) },
    {
      header: 'Status',
      render: (n) => (
        <span className={`badge ${n.status === 'EMITIDA' ? 'badge--green' : 'badge--red'}`}>
          {n.status}
        </span>
      ),
    },
    {
      header: 'Ações',
      render: (n) =>
        n.status === 'EMITIDA' ? (
          <Button variant="danger" size="sm" onClick={() => cancelar(n.id)}>
            Cancelar
          </Button>
        ) : (
          <span className="crud__hint">—</span>
        ),
    },
  ];

  return (
    <div className="crud">
      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Emitir NFS-e</h2>
          <span className="crud__hint">Emissão simulada (sem integração fiscal real)</span>
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
            label="Valor (R$)"
            type="number"
            step="0.01"
            min="0"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          <Field
            label="Descrição do serviço"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <div className="crud__actions">
          <Button onClick={emitir} disabled={emitindo || !alunoId || !valor}>
            {emitindo ? 'Emitindo…' : 'Emitir nota'}
          </Button>
        </div>
      </section>

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Notas emitidas</h2>
          <span className="crud__hint">{notas.length} registro(s)</span>
        </div>
        <DataTable columns={colunas} rows={notas} empty="Nenhuma nota emitida." />
      </section>
    </div>
  );
}
