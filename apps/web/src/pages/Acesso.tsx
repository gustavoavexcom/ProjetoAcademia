import { useEffect, useState } from 'react';
import { TipoAcesso, type Aluno, type ResultadoCheckin } from '@academia/shared';
import { apiDelete, apiGet, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { Field, SelectField } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';
import { QrScanner } from '../ui/QrScanner';

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
  const [tipoCatraca, setTipoCatraca] = useState<TipoAcesso>(TipoAcesso.ENTRADA);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<ResultadoCheckin | null>(null);
  const [erroLeitura, setErroLeitura] = useState<string>();
  // Fallback sem QR: busca por matrícula + confirmação visual pela foto.
  const [matricula, setMatricula] = useState('');
  const [alunoMatricula, setAlunoMatricula] = useState<Aluno | null>(null);
  const [erroMatricula, setErroMatricula] = useState<string>();
  const [buscando, setBuscando] = useState(false);

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

  /** Lê o QR do aluno e confirma o acesso na catraca. */
  async function aoLerQr(qrCode: string) {
    if (processando) return;
    setProcessando(true);
    setErroLeitura(undefined);
    try {
      const r = await apiPost<ResultadoCheckin>('/acessos/checkin', {
        qrCode,
        tipo: tipoCatraca,
      });
      setResultado(r);
      await carregar();
    } catch (e) {
      setResultado(null);
      setErroLeitura((e as Error).message);
    } finally {
      // Pequena pausa para o operador ver a confirmação antes da próxima leitura.
      setTimeout(() => setProcessando(false), 2000);
    }
  }

  /** Busca o aluno pela matrícula para o atendente confirmar a foto antes de gravar. */
  async function buscarPorMatricula() {
    const numero = matricula.trim();
    if (!numero) return;
    setBuscando(true);
    setErroMatricula(undefined);
    setAlunoMatricula(null);
    try {
      const aluno = await apiGet<Aluno>(`/alunos/matricula/${numero}`);
      setAlunoMatricula(aluno);
    } catch (e) {
      setErroMatricula((e as Error).message);
    } finally {
      setBuscando(false);
    }
  }

  /** Confirma a presença do aluno localizado por matrícula (cria um registro de acesso). */
  async function confirmarPorMatricula(tipo: TipoAcesso) {
    if (!alunoMatricula) return;
    setErroMatricula(undefined);
    try {
      await apiPost('/acessos', { alunoId: alunoMatricula.id, tipo });
      await carregar();
      setMatricula('');
      setAlunoMatricula(null);
    } catch (e) {
      setErroMatricula((e as Error).message);
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
          <h2>Catraca — leitura de QR code</h2>
          <span className="crud__hint">
            Use a câmera do notebook para ler o QR do aluno e confirmar o acesso.
          </span>
        </div>
        <div className="crud__form-grid">
          <SelectField
            label="Tipo de registro"
            value={tipoCatraca}
            onChange={(e) => setTipoCatraca(e.target.value as TipoAcesso)}
          >
            <option value={TipoAcesso.ENTRADA}>Entrada</option>
            <option value={TipoAcesso.SAIDA}>Saída</option>
          </SelectField>
        </div>
        <QrScanner onScan={aoLerQr} paused={processando} />
        {resultado && (
          <div className="checkin" style={{ marginTop: 'var(--space-4)' }}>
            {resultado.aluno.fotoBase64 ? (
              <img
                src={resultado.aluno.fotoBase64}
                alt={resultado.aluno.nome}
                className="checkin__foto"
              />
            ) : null}
            <div>
              <div className="checkin__nome">
                {resultado.acesso.tipo === TipoAcesso.ENTRADA ? 'Entrada' : 'Saída'} confirmada —{' '}
                {resultado.aluno.nome}
              </div>
              <div className="checkin__meta">
                {dataHora(resultado.acesso.registro)} · situação: {resultado.aluno.status}
              </div>
            </div>
          </div>
        )}
        {erroLeitura && (
          <div className="checkin checkin--erro" style={{ marginTop: 'var(--space-4)' }}>
            <div>
              <div className="checkin__nome">QR não reconhecido</div>
              <div className="checkin__meta">{erroLeitura}</div>
            </div>
          </div>
        )}
      </section>

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Catraca — sem QR (busca por matrícula)</h2>
          <span className="crud__hint">
            Quando o aluno não traz o QR, informe a matrícula e confirme pela foto.
          </span>
        </div>
        <div className="crud__form-grid">
          <Field
            label="Número de matrícula"
            type="number"
            inputMode="numeric"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') buscarPorMatricula();
            }}
          />
        </div>
        <div className="crud__actions">
          <Button onClick={buscarPorMatricula} disabled={!matricula.trim() || buscando}>
            {buscando ? 'Buscando…' : 'Buscar'}
          </Button>
        </div>
        {alunoMatricula && (
          <>
            <div className="checkin" style={{ marginTop: 'var(--space-4)' }}>
              {alunoMatricula.fotoBase64 ? (
                <img
                  src={alunoMatricula.fotoBase64}
                  alt={alunoMatricula.nome}
                  className="checkin__foto"
                />
              ) : null}
              <div>
                <div className="checkin__nome">
                  {alunoMatricula.nome} · matrícula {alunoMatricula.matricula}
                </div>
                <div className="checkin__meta">
                  Confira se é a pessoa antes de confirmar · situação: {alunoMatricula.status}
                </div>
              </div>
            </div>
            <div className="crud__actions" style={{ marginTop: 'var(--space-4)' }}>
              <Button onClick={() => confirmarPorMatricula(TipoAcesso.ENTRADA)}>
                Confirmar entrada
              </Button>
              <Button
                variant="secondary"
                onClick={() => confirmarPorMatricula(TipoAcesso.SAIDA)}
              >
                Confirmar saída
              </Button>
            </div>
          </>
        )}
        {erroMatricula && (
          <div className="checkin checkin--erro" style={{ marginTop: 'var(--space-4)' }}>
            <div>
              <div className="checkin__nome">Matrícula não encontrada</div>
              <div className="checkin__meta">{erroMatricula}</div>
            </div>
          </div>
        )}
      </section>

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Catraca — registro manual</h2>
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
