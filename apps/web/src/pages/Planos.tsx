import { useEffect, useState } from 'react';
import type { Plano } from '@academia/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { Field, SelectField, avancarComEnter } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface FormState {
  nome: string;
  valorMensal: string;
  descricao: string;
  ativo: string;
}

const VAZIO: FormState = { nome: '', valorMensal: '', descricao: '', ativo: 'true' };

const moeda = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Planos() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [form, setForm] = useState<FormState>(VAZIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [erro, setErro] = useState<string>();
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setPlanos(await apiGet<Plano[]>('/planos'));
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

  function editar(p: Plano) {
    setEditId(p.id);
    setErro(undefined);
    setForm({
      nome: p.nome,
      valorMensal: String(p.valorMensal),
      descricao: p.descricao ?? '',
      ativo: String(p.ativo),
    });
  }

  async function salvar() {
    setSalvando(true);
    setErro(undefined);
    const payload = {
      nome: form.nome,
      valorMensal: Number(form.valorMensal),
      descricao: form.descricao || undefined,
      ativo: form.ativo === 'true',
    };
    try {
      if (editId) await apiPatch(`/planos/${editId}`, payload);
      else await apiPost('/planos', payload);
      limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este plano?')) return;
    try {
      await apiDelete(`/planos/${id}`);
      if (editId === id) limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const colunas: Column<Plano>[] = [
    { header: 'Nome', render: (p) => p.nome },
    { header: 'Valor mensal', render: (p) => moeda(Number(p.valorMensal)) },
    { header: 'Descrição', render: (p) => p.descricao ?? '—' },
    {
      header: 'Situação',
      render: (p) => (
        <span className={`badge ${p.ativo ? 'badge--green' : 'badge--red'}`}>
          {p.ativo ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
    {
      header: 'Ações',
      render: (p) => (
        <div className="crud__actions">
          <Button variant="secondary" size="sm" onClick={() => editar(p)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => excluir(p.id)}>
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
          <h2>{editId ? 'Editar plano' : 'Cadastrar plano'}</h2>
        </div>
        {erro && <div className="alert alert--error">{erro}</div>}
        <div className="crud__form-grid" onKeyDown={avancarComEnter}>
          <Field
            label="Nome"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <Field
            label="Valor mensal (R$)"
            type="number"
            step="0.01"
            min="0"
            value={form.valorMensal}
            onChange={(e) => setForm({ ...form, valorMensal: e.target.value })}
          />
          <Field
            label="Descrição"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
          <SelectField
            label="Situação"
            value={form.ativo}
            onChange={(e) => setForm({ ...form, ativo: e.target.value })}
          >
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </SelectField>
        </div>
        <div className="crud__actions">
          <Button onClick={salvar} disabled={salvando || !form.nome || !form.valorMensal}>
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
          <h2>Planos cadastrados</h2>
          <span className="crud__hint">{planos.length} registro(s)</span>
        </div>
        <DataTable columns={colunas} rows={planos} empty="Nenhum plano cadastrado." />
      </section>
    </div>
  );
}
