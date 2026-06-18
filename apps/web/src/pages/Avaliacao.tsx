import { useEffect, useState } from 'react';
import {
  ObjetivoTreino,
  type Recomendacao,
  type ResultadoImc,
} from '@academia/shared';
import { apiGet, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { Field, SelectField, TextAreaField } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface AlunoEncontrado {
  id: string;
  nome: string;
  cpf: string;
  telefone?: string | null;
  status: string;
  plano?: { nome: string } | null;
}

interface AvaliacaoRow {
  id: string;
  data: string;
  pesoKg?: string | null;
  alturaCm?: number | null;
  percentualGordura?: string | null;
  objetivo?: ObjetivoTreino | null;
  observacoes?: string | null;
}

interface ObjetivoOpcao {
  valor: ObjetivoTreino;
  rotulo: string;
}

type Aba = 'avaliacao' | 'recomendacao' | 'historico';

const dataBr = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/** Calcula o IMC no front para feedback imediato (mesma fórmula da API). */
function imcLocal(pesoKg: string, alturaCm: string): ResultadoImc | null {
  const peso = Number(pesoKg);
  const altura = Number(alturaCm);
  if (!peso || !altura) return null;
  const alturaM = altura / 100;
  const valor = Math.round((peso / (alturaM * alturaM)) * 10) / 10;
  let classificacao = 'Obesidade';
  if (valor < 18.5) classificacao = 'Abaixo do peso';
  else if (valor < 25) classificacao = 'Peso normal';
  else if (valor < 30) classificacao = 'Sobrepeso';
  return { valor, classificacao };
}

export default function Avaliacao() {
  const [objetivos, setObjetivos] = useState<ObjetivoOpcao[]>([]);
  const [erro, setErro] = useState<string>();
  const [ok, setOk] = useState<string>();

  // Busca por CPF
  const [cpf, setCpf] = useState('');
  const [aluno, setAluno] = useState<AlunoEncontrado | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [aba, setAba] = useState<Aba>('avaliacao');

  // Formulário de avaliação
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');
  const [gordura, setGordura] = useState('');
  const [objetivo, setObjetivo] = useState<ObjetivoTreino | ''>('');
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Histórico e recomendação
  const [historico, setHistorico] = useState<AvaliacaoRow[]>([]);
  const [reco, setReco] = useState<Recomendacao | null>(null);
  const [gerando, setGerando] = useState(false);

  useEffect(() => {
    apiGet<ObjetivoOpcao[]>('/recomendacoes/objetivos')
      .then(setObjetivos)
      .catch((e) => setErro((e as Error).message));
  }, []);

  async function carregarHistorico(alunoId: string) {
    try {
      const av = await apiGet<AvaliacaoRow[]>(`/avaliacoes?alunoId=${alunoId}`);
      setHistorico(av);
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  async function buscar() {
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (!cpfLimpo) return;
    setBuscando(true);
    setErro(undefined);
    setOk(undefined);
    setReco(null);
    try {
      const a = await apiGet<AlunoEncontrado>(`/alunos/cpf/${cpfLimpo}`);
      setAluno(a);
      await carregarHistorico(a.id);
    } catch (e) {
      setAluno(null);
      setHistorico([]);
      setErro((e as Error).message);
    } finally {
      setBuscando(false);
    }
  }

  async function salvarAvaliacao() {
    if (!aluno) return;
    setSalvando(true);
    setErro(undefined);
    setOk(undefined);
    const payload: Record<string, unknown> = { alunoId: aluno.id };
    if (peso) payload.pesoKg = Number(peso);
    if (altura) payload.alturaCm = Number(altura);
    if (gordura) payload.percentualGordura = Number(gordura);
    if (objetivo) payload.objetivo = objetivo;
    if (obs) payload.observacoes = obs;
    try {
      await apiPost('/avaliacoes', payload);
      setOk('Avaliação registrada com sucesso.');
      setGordura('');
      setObs('');
      await carregarHistorico(aluno.id);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function gerarRecomendacao() {
    if (!objetivo) {
      setErro('Selecione um objetivo para gerar a recomendação.');
      return;
    }
    setGerando(true);
    setErro(undefined);
    const payload: Record<string, unknown> = { objetivo };
    if (peso) payload.pesoKg = Number(peso);
    if (altura) payload.alturaCm = Number(altura);
    try {
      const r = await apiPost<Recomendacao>('/recomendacoes', payload);
      setReco(r);
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setGerando(false);
    }
  }

  const rotuloObjetivo = (o?: ObjetivoTreino | null) =>
    objetivos.find((op) => op.valor === o)?.rotulo ?? (o ? String(o) : '—');

  const imc = imcLocal(peso, altura);

  const colHist: Column<AvaliacaoRow>[] = [
    { header: 'Data', render: (a) => dataBr(a.data) },
    { header: 'Peso (kg)', render: (a) => (a.pesoKg ? Number(a.pesoKg) : '—') },
    { header: 'Altura (cm)', render: (a) => a.alturaCm ?? '—' },
    {
      header: '% Gordura',
      render: (a) => (a.percentualGordura ? Number(a.percentualGordura) : '—'),
    },
    { header: 'Objetivo', render: (a) => rotuloObjetivo(a.objetivo) },
  ];

  return (
    <div className="crud">
      {erro && <div className="alert alert--error">{erro}</div>}
      {ok && <div className="alert alert--ok">{ok}</div>}

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Localizar aluno por CPF</h2>
          <span className="crud__hint">Dado sensível (LGPD)</span>
        </div>
        <div className="crud__form-grid">
          <Field
            label="CPF do aluno"
            value={cpf}
            onChange={(e) => setCpf(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') buscar();
            }}
          />
        </div>
        <div className="crud__actions">
          <Button onClick={buscar} disabled={buscando || !cpf}>
            {buscando ? 'Buscando…' : 'Buscar'}
          </Button>
        </div>

        {aluno && (
          <div className="aluno-card" style={{ marginTop: 'var(--space-4)' }}>
            <div className="aluno-card__item">
              <span className="aluno-card__label">Nome</span>
              <span className="aluno-card__valor">{aluno.nome}</span>
            </div>
            <div className="aluno-card__item">
              <span className="aluno-card__label">CPF</span>
              <span className="aluno-card__valor">{aluno.cpf}</span>
            </div>
            <div className="aluno-card__item">
              <span className="aluno-card__label">Telefone</span>
              <span className="aluno-card__valor">{aluno.telefone ?? '—'}</span>
            </div>
            <div className="aluno-card__item">
              <span className="aluno-card__label">Plano</span>
              <span className="aluno-card__valor">{aluno.plano?.nome ?? '—'}</span>
            </div>
            <div className="aluno-card__item">
              <span className="aluno-card__label">Status</span>
              <span className="aluno-card__valor">{aluno.status}</span>
            </div>
          </div>
        )}
      </section>

      {aluno && (
        <section className="crud__panel">
          <div className="tabs">
            <button
              className={`tabs__btn${aba === 'avaliacao' ? ' is-active' : ''}`}
              onClick={() => setAba('avaliacao')}
            >
              Avaliação física
            </button>
            <button
              className={`tabs__btn${aba === 'recomendacao' ? ' is-active' : ''}`}
              onClick={() => setAba('recomendacao')}
            >
              Recomendação
            </button>
            <button
              className={`tabs__btn${aba === 'historico' ? ' is-active' : ''}`}
              onClick={() => setAba('historico')}
            >
              Histórico ({historico.length})
            </button>
          </div>

          {aba === 'avaliacao' && (
            <>
              {imc && (
                <div className="imc-box">
                  <span className="aluno-card__label">IMC</span>
                  <span className="imc-box__valor">{imc.valor}</span>
                  <span className="imc-box__class">{imc.classificacao}</span>
                </div>
              )}
              <div className="crud__form-grid">
                <Field
                  label="Peso (kg)"
                  type="number"
                  step="0.1"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                />
                <Field
                  label="Altura (cm)"
                  type="number"
                  value={altura}
                  onChange={(e) => setAltura(e.target.value)}
                />
                <Field
                  label="% Gordura"
                  type="number"
                  step="0.1"
                  value={gordura}
                  onChange={(e) => setGordura(e.target.value)}
                />
                <SelectField
                  label="Objetivo"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value as ObjetivoTreino)}
                >
                  <option value="">— selecione —</option>
                  {objetivos.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </option>
                  ))}
                </SelectField>
                <TextAreaField
                  label="Observações"
                  value={obs}
                  onChange={(e) => setObs(e.target.value)}
                />
              </div>
              <div className="crud__actions">
                <Button onClick={salvarAvaliacao} disabled={salvando}>
                  {salvando ? 'Salvando…' : 'Salvar avaliação'}
                </Button>
              </div>
            </>
          )}

          {aba === 'recomendacao' && (
            <>
              <div className="crud__form-grid">
                <SelectField
                  label="Objetivo"
                  value={objetivo}
                  onChange={(e) => setObjetivo(e.target.value as ObjetivoTreino)}
                >
                  <option value="">— selecione —</option>
                  {objetivos.map((o) => (
                    <option key={o.valor} value={o.valor}>
                      {o.rotulo}
                    </option>
                  ))}
                </SelectField>
              </div>
              <div className="crud__actions">
                <Button onClick={gerarRecomendacao} disabled={gerando || !objetivo}>
                  {gerando ? 'Gerando…' : 'Gerar recomendação'}
                </Button>
              </div>

              {reco && (
                <div style={{ marginTop: 'var(--space-5)' }}>
                  {reco.imc && (
                    <div className="imc-box">
                      <span className="aluno-card__label">IMC</span>
                      <span className="imc-box__valor">{reco.imc.valor}</span>
                      <span className="imc-box__class">{reco.imc.classificacao}</span>
                    </div>
                  )}
                  <div className="reco-grid">
                    <div className="reco-list">
                      <h3>Exercícios</h3>
                      <ul>
                        {reco.exercicios.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="reco-list">
                      <h3>Alimentação</h3>
                      <ul>
                        {reco.alimentacao.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="reco-list">
                      <h3>Suplementos</h3>
                      <ul>
                        {reco.suplementos.map((x, i) => (
                          <li key={i}>{x}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <p className="crud__hint" style={{ marginTop: 'var(--space-4)' }}>
                    Orientação geral — não substitui acompanhamento de instrutor/nutricionista.
                  </p>
                </div>
              )}
            </>
          )}

          {aba === 'historico' && (
            <DataTable
              columns={colHist}
              rows={historico}
              empty="Nenhuma avaliação registrada para este aluno."
            />
          )}
        </section>
      )}
    </div>
  );
}
