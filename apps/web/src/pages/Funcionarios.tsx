import { useEffect, useState } from 'react';
import type { Funcionario } from '@academia/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { AutocompleteField, Field, avancarComEnter } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface FormState {
  nome: string;
  cpf: string;
  funcao: string;
  turno: string;
}

const VAZIO: FormState = { nome: '', cpf: '', funcao: '', turno: '' };

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [form, setForm] = useState<FormState>(VAZIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [erro, setErro] = useState<string>();
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setFuncionarios(await apiGet<Funcionario[]>('/funcionarios'));
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

  function editar(f: Funcionario) {
    setEditId(f.id);
    setErro(undefined);
    setForm({
      nome: f.nome,
      cpf: f.cpf,
      funcao: f.funcao,
      turno: f.turno ?? '',
    });
  }

  async function salvar() {
    setSalvando(true);
    setErro(undefined);
    const payload = {
      nome: form.nome,
      cpf: form.cpf.replace(/\D/g, ''),
      funcao: form.funcao,
      turno: form.turno || undefined,
    };
    try {
      if (editId) await apiPatch(`/funcionarios/${editId}`, payload);
      else await apiPost('/funcionarios', payload);
      limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este funcionário?')) return;
    try {
      await apiDelete(`/funcionarios/${id}`);
      if (editId === id) limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const colunas: Column<Funcionario>[] = [
    { header: 'Nome', render: (f) => f.nome },
    { header: 'CPF', render: (f) => f.cpf },
    { header: 'Função', render: (f) => f.funcao },
    { header: 'Turno', render: (f) => f.turno ?? '—' },
    {
      header: 'Ações',
      render: (f) => (
        <div className="crud__actions">
          <Button variant="secondary" size="sm" onClick={() => editar(f)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => excluir(f.id)}>
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
          <h2>{editId ? 'Editar funcionário' : 'Cadastrar funcionário'}</h2>
        </div>
        {erro && <div className="alert alert--error">{erro}</div>}
        <div className="crud__form-grid" onKeyDown={avancarComEnter}>
          <AutocompleteField
            label="Nome"
            options={funcionarios.map((f) => f.nome)}
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <Field
            label="CPF"
            value={form.cpf}
            onChange={(e) => setForm({ ...form, cpf: e.target.value })}
          />
          <AutocompleteField
            label="Função"
            options={Array.from(new Set(funcionarios.map((f) => f.funcao)))}
            value={form.funcao}
            onChange={(e) => setForm({ ...form, funcao: e.target.value })}
          />
          <Field
            label="Turno / Horário"
            value={form.turno}
            onChange={(e) => setForm({ ...form, turno: e.target.value })}
          />
        </div>
        <div className="crud__actions">
          <Button onClick={salvar} disabled={salvando || !form.nome || !form.cpf || !form.funcao}>
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
          <h2>Funcionários cadastrados</h2>
          <span className="crud__hint">{funcionarios.length} registro(s)</span>
        </div>
        <DataTable
          columns={colunas}
          rows={funcionarios}
          empty="Nenhum funcionário cadastrado."
        />
      </section>
    </div>
  );
}
