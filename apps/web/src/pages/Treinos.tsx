import { useEffect, useState } from 'react';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { Field, SelectField } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface AlunoMin {
  id: string;
  nome: string;
}

interface ExercicioForm {
  nome: string;
  series: string;
  repeticoes: string;
  cargaKg: string;
}

interface TreinoRow {
  id: string;
  nome: string;
  objetivo?: string | null;
  instrutor?: string | null;
  alunoId?: string | null;
  aluno?: { nome: string } | null;
  exercicios?: { id: string; nome: string }[];
}

export default function Treinos() {
  const [alunos, setAlunos] = useState<AlunoMin[]>([]);
  const [treinos, setTreinos] = useState<TreinoRow[]>([]);
  const [erro, setErro] = useState<string>();

  // --- Formulário de treino ---
  const [tNome, setTNome] = useState('');
  const [tObjetivo, setTObjetivo] = useState('');
  const [tInstrutor, setTInstrutor] = useState('');
  const [tAluno, setTAluno] = useState('');
  const [exercicios, setExercicios] = useState<ExercicioForm[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  async function carregar() {
    try {
      const [t, a] = await Promise.all([
        apiGet<TreinoRow[]>('/treinos'),
        apiGet<AlunoMin[]>('/alunos'),
      ]);
      setTreinos(t);
      setAlunos(a);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  function limparTreino() {
    setTNome('');
    setTObjetivo('');
    setTInstrutor('');
    setTAluno('');
    setExercicios([]);
    setEditId(null);
  }

  function editarTreino(t: TreinoRow) {
    setEditId(t.id);
    setTNome(t.nome);
    setTObjetivo(t.objetivo ?? '');
    setTInstrutor(t.instrutor ?? '');
    setTAluno(t.alunoId ?? '');
    setExercicios(
      (t.exercicios ?? []).map((e) => ({
        nome: e.nome,
        series: '',
        repeticoes: '',
        cargaKg: '',
      })),
    );
  }

  function addExercicio() {
    setExercicios([...exercicios, { nome: '', series: '', repeticoes: '', cargaKg: '' }]);
  }

  function setExercicio(i: number, campo: keyof ExercicioForm, valor: string) {
    setExercicios(exercicios.map((e, idx) => (idx === i ? { ...e, [campo]: valor } : e)));
  }

  async function salvarTreino() {
    setErro(undefined);
    const payload: Record<string, unknown> = {
      nome: tNome,
      objetivo: tObjetivo || undefined,
      instrutor: tInstrutor || undefined,
      alunoId: tAluno || undefined,
      exercicios: exercicios
        .filter((e) => e.nome.trim())
        .map((e) => ({
          nome: e.nome,
          series: e.series ? Number(e.series) : undefined,
          repeticoes: e.repeticoes || undefined,
          cargaKg: e.cargaKg ? Number(e.cargaKg) : undefined,
        })),
    };
    try {
      if (editId) await apiPatch(`/treinos/${editId}`, payload);
      else await apiPost('/treinos', payload);
      limparTreino();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function excluirTreino(id: string) {
    if (!confirm('Excluir este treino?')) return;
    try {
      await apiDelete(`/treinos/${id}`);
      if (editId === id) limparTreino();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const colTreinos: Column<TreinoRow>[] = [
    { header: 'Treino', render: (t) => t.nome },
    { header: 'Objetivo', render: (t) => t.objetivo ?? '—' },
    { header: 'Instrutor', render: (t) => t.instrutor ?? '—' },
    { header: 'Aluno', render: (t) => t.aluno?.nome ?? <span className="badge">não atribuído</span> },
    { header: 'Exercícios', render: (t) => String(t.exercicios?.length ?? 0) },
    {
      header: 'Ações',
      render: (t) => (
        <div className="crud__actions">
          <Button variant="secondary" size="sm" onClick={() => editarTreino(t)}>
            Editar / atribuir
          </Button>
          <Button variant="danger" size="sm" onClick={() => excluirTreino(t.id)}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="crud">
      {erro && <div className="alert alert--error">{erro}</div>}

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>{editId ? 'Editar treino' : 'Cadastrar treino'}</h2>
        </div>
        <div className="crud__form-grid">
          <Field label="Nome" value={tNome} onChange={(e) => setTNome(e.target.value)} />
          <Field label="Objetivo" value={tObjetivo} onChange={(e) => setTObjetivo(e.target.value)} />
          <Field label="Instrutor" value={tInstrutor} onChange={(e) => setTInstrutor(e.target.value)} />
          <SelectField label="Atribuir ao aluno" value={tAluno} onChange={(e) => setTAluno(e.target.value)}>
            <option value="">— não atribuído —</option>
            {alunos.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nome}
              </option>
            ))}
          </SelectField>
        </div>

        <div className="crud__panel-head">
          <h2 style={{ fontSize: '0.95rem' }}>Exercícios</h2>
          <Button variant="secondary" size="sm" onClick={addExercicio}>
            + Adicionar exercício
          </Button>
        </div>
        {exercicios.map((ex, i) => (
          <div className="crud__form-grid" key={i}>
            <Field
              label="Exercício"
              value={ex.nome}
              onChange={(e) => setExercicio(i, 'nome', e.target.value)}
            />
            <Field
              label="Séries"
              type="number"
              min="1"
              value={ex.series}
              onChange={(e) => setExercicio(i, 'series', e.target.value)}
            />
            <Field
              label="Repetições"
              value={ex.repeticoes}
              onChange={(e) => setExercicio(i, 'repeticoes', e.target.value)}
            />
            <Field
              label="Carga (kg)"
              type="number"
              step="0.5"
              min="0"
              value={ex.cargaKg}
              onChange={(e) => setExercicio(i, 'cargaKg', e.target.value)}
            />
          </div>
        ))}

        <div className="crud__actions">
          <Button onClick={salvarTreino} disabled={!tNome}>
            Salvar
          </Button>
          {editId && (
            <Button variant="ghost" onClick={limparTreino}>
              Cancelar
            </Button>
          )}
        </div>
      </section>

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Treinos cadastrados</h2>
          <span className="crud__hint">{treinos.length} registro(s)</span>
        </div>
        <DataTable columns={colTreinos} rows={treinos} empty="Nenhum treino cadastrado." />
      </section>
    </div>
  );
}
