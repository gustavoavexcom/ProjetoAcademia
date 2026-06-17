import { useEffect, useState } from 'react';
import { TipoAcesso } from '@academia/shared';
import { apiDelete, apiGet, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { SelectField } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface AlunoMin {
  id: string;
  nome: string;
}

interface AcessoRow {
  id: string;
  tipo: TipoAcesso;
  registro: string;
  aluno?: { nome: string };
}

const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR');

export default function Acesso() {
  const [alunos, setAlunos] = useState<AlunoMin[]>([]);
  const [acessos, setAcessos] = useState<AcessoRow[]>([]);
  const [alunoId, setAlunoId] = useState('');
  const [erro, setErro] = useState<string>();

  async function carregar() {
    try {
      const [ac, al] = await Promise.all([
        apiGet<AcessoRow[]>('/acessos'),
        apiGet<AlunoMin[]>('/alunos'),
      ]);
      setAcessos(ac);
      setAlunos(al);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function registrar(tipo: TipoAcesso) {
    if (!alunoId) return;
    setErro(undefined);
    try {
      await apiPost('/acessos', { alunoId, tipo });
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este registro de acesso?')) return;
    try {
      await apiDelete(`/acessos/${id}`);
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const colunas: Column<AcessoRow>[] = [
    { header: 'Aluno', render: (a) => a.aluno?.nome ?? '—' },
    {
      header: 'Tipo',
      render: (a) => (
        <span className={`badge ${a.tipo === 'ENTRADA' ? 'badge--green' : 'badge--orange'}`}>
          {a.tipo}
        </span>
      ),
    },
    { header: 'Data/hora', render: (a) => dataHora(a.registro) },
    {
      header: 'Ações',
      render: (a) => (
        <Button variant="danger" size="sm" onClick={() => excluir(a.id)}>
          Excluir
        </Button>
      ),
    },
  ];

  return (
    <div className="crud">
      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Catraca — registrar acesso</h2>
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
        </div>
        <div className="crud__actions">
          <Button onClick={() => registrar(TipoAcesso.ENTRADA)} disabled={!alunoId}>
            Registrar entrada
          </Button>
          <Button
            variant="secondary"
            onClick={() => registrar(TipoAcesso.SAIDA)}
            disabled={!alunoId}
          >
            Registrar saída
          </Button>
        </div>
      </section>

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Histórico de acessos</h2>
          <span className="crud__hint">{acessos.length} registro(s)</span>
        </div>
        <DataTable columns={colunas} rows={acessos} empty="Nenhum acesso registrado." />
      </section>
    </div>
  );
}
