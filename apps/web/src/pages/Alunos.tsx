import { useEffect, useState } from 'react';
import { StatusAluno, type Plano } from '@academia/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { Field, SelectField } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface AlunoRow {
  id: string;
  nome: string;
  email?: string | null;
  cpf: string;
  telefone?: string | null;
  status: StatusAluno;
  dataMatricula?: string | null;
  planoId?: string | null;
  plano?: Plano | null;
}

interface FormState {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  status: StatusAluno;
  dataMatricula: string;
  planoId: string;
}

const VAZIO: FormState = {
  nome: '',
  email: '',
  cpf: '',
  telefone: '',
  status: StatusAluno.ATIVO,
  dataMatricula: '',
  planoId: '',
};

const BADGE: Record<StatusAluno, string> = {
  ATIVO: 'badge--green',
  INATIVO: 'badge',
  SUSPENSO: 'badge--orange',
  TRANCADO: 'badge--orange',
  CANCELADO: 'badge--red',
};

export default function Alunos() {
  const [alunos, setAlunos] = useState<AlunoRow[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [form, setForm] = useState<FormState>(VAZIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [erro, setErro] = useState<string>();
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      const [a, p] = await Promise.all([
        apiGet<AlunoRow[]>('/alunos'),
        apiGet<Plano[]>('/planos'),
      ]);
      setAlunos(a);
      setPlanos(p);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function limpar() {
    setForm(VAZIO);
    setEditId(null);
    setErro(undefined);
  }

  function editar(a: AlunoRow) {
    setEditId(a.id);
    setErro(undefined);
    setForm({
      nome: a.nome,
      email: a.email ?? '',
      cpf: a.cpf,
      telefone: a.telefone ?? '',
      status: a.status,
      dataMatricula: a.dataMatricula ? a.dataMatricula.slice(0, 10) : '',
      planoId: a.planoId ?? '',
    });
  }

  async function salvar() {
    setSalvando(true);
    setErro(undefined);
    const payload: Record<string, unknown> = {
      nome: form.nome,
      cpf: form.cpf.replace(/\D/g, ''),
      status: form.status,
    };
    if (form.email) payload.email = form.email;
    if (form.telefone) payload.telefone = form.telefone;
    if (form.dataMatricula) payload.dataMatricula = form.dataMatricula;
    if (form.planoId) payload.planoId = form.planoId;

    try {
      if (editId) {
        await apiPatch(`/alunos/${editId}`, payload);
      } else {
        await apiPost('/alunos', payload);
      }
      limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este aluno?')) return;
    try {
      await apiDelete(`/alunos/${id}`);
      if (editId === id) limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const colunas: Column<AlunoRow>[] = [
    { header: 'Nome', render: (a) => a.nome },
    { header: 'CPF/CNPJ', render: (a) => a.cpf },
    { header: 'Telefone', render: (a) => a.telefone ?? '—' },
    { header: 'Plano', render: (a) => a.plano?.nome ?? '—' },
    {
      header: 'Status',
      render: (a) => <span className={`badge ${BADGE[a.status]}`}>{a.status}</span>,
    },
    {
      header: 'Ações',
      render: (a) => (
        <div className="crud__actions">
          <Button variant="secondary" size="sm" onClick={() => editar(a)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => excluir(a.id)}>
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
          <h2>{editId ? 'Editar aluno' : 'Cadastrar aluno'}</h2>
        </div>
        {erro && <div className="alert alert--error">{erro}</div>}
        <div className="crud__form-grid">
          <Field
            label="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <Field
            label="CPF / CNPJ"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
          />
          <Field
            label="Telefone"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          />
          <Field
            label="E-mail"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Field
            label="Data de matrícula"
            type="date"
            value={form.dataMatricula}
            onChange={(e) => setForm({ ...form, dataMatricula: e.target.value })}
          />
          <SelectField
            label="Plano"
            value={form.planoId}
            onChange={(e) => setForm({ ...form, planoId: e.target.value })}
          >
            <option value="">— sem plano —</option>
            {planos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </SelectField>
          <SelectField
            label="Status"
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as StatusAluno })
            }
          >
            {Object.values(StatusAluno).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="crud__actions">
          <Button onClick={salvar} disabled={salvando || !form.nome || !form.cpf}>
            {salvando ? 'Salvando…' : 'Salvar'}
          </Button>
          {editId && (
            <Button variant="ghost" onClick={limpar}>
              Cancelar
            </Button>
          )}
        </div>
      </section>

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Alunos cadastrados</h2>
          <span className="crud__hint">{alunos.length} registro(s)</span>
        </div>
        <DataTable columns={colunas} rows={alunos} empty="Nenhum aluno cadastrado." />
      </section>
    </div>
  );
}
