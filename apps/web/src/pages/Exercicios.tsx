import { useEffect, useState } from 'react';
import type { Exercicio } from '@academia/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { AutocompleteField, Field, avancarComEnter } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface FormState {
  nome: string;
  grupoMuscular: string;
  aparelho: string;
}

const VAZIO: FormState = { nome: '', grupoMuscular: '', aparelho: '' };

export default function Exercicios() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([]);
  const [form, setForm] = useState<FormState>(VAZIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [erro, setErro] = useState<string>();
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setExercicios(await apiGet<Exercicio[]>('/exercicios'));
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

  function editar(ex: Exercicio) {
    setEditId(ex.id);
    setErro(undefined);
    setForm({
      nome: ex.nome,
      grupoMuscular: ex.grupoMuscular,
      aparelho: ex.aparelho,
    });
  }

  async function salvar() {
    setSalvando(true);
    setErro(undefined);
    const payload = {
      nome: form.nome,
      grupoMuscular: form.grupoMuscular,
      aparelho: form.aparelho,
    };
    try {
      if (editId) await apiPatch(`/exercicios/${editId}`, payload);
      else await apiPost('/exercicios', payload);
      limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este exercício?')) return;
    try {
      await apiDelete(`/exercicios/${id}`);
      if (editId === id) limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const colunas: Column<Exercicio>[] = [
    { header: 'Exercício', render: (ex) => ex.nome },
    { header: 'Grupo muscular', render: (ex) => ex.grupoMuscular },
    { header: 'Aparelho / equipamento', render: (ex) => ex.aparelho },
    {
      header: 'Ações',
      render: (ex) => (
        <div className="crud__actions">
          <Button variant="secondary" size="sm" onClick={() => editar(ex)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => excluir(ex.id)}>
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
          <h2>{editId ? 'Editar exercício' : 'Cadastrar exercício'}</h2>
        </div>
        {erro && <div className="alert alert--error">{erro}</div>}
        <div className="crud__form-grid" onKeyDown={avancarComEnter}>
          <AutocompleteField
            label="Nome do exercício"
            options={exercicios.map((ex) => ex.nome)}
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <AutocompleteField
            label="Grupo muscular"
            options={Array.from(new Set(exercicios.map((ex) => ex.grupoMuscular)))}
            value={form.grupoMuscular}
            onChange={(e) => setForm({ ...form, grupoMuscular: e.target.value })}
          />
          <AutocompleteField
            label="Aparelho / equipamento"
            options={Array.from(new Set(exercicios.map((ex) => ex.aparelho)))}
            value={form.aparelho}
            onChange={(e) => setForm({ ...form, aparelho: e.target.value })}
          />
        </div>
        <div className="crud__actions">
          <Button
            onClick={salvar}
            disabled={salvando || !form.nome || !form.grupoMuscular || !form.aparelho}
          >
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
          <h2>Catálogo de exercícios e aparelhos</h2>
          <span className="crud__hint">{exercicios.length} registro(s)</span>
        </div>
        <DataTable
          columns={colunas}
          rows={exercicios}
          empty="Nenhum exercício cadastrado."
        />
      </section>
    </div>
  );
}
