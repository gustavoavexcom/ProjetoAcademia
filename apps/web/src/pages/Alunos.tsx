import { useEffect, useState } from 'react';
import { StatusAluno, type Plano } from '@academia/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { AutocompleteField, Field, SelectField, avancarComEnter } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';
import { CameraCapture } from '../ui/CameraCapture';
import { QrCode } from '../ui/QrCode';

interface AlunoRow {
  id: string;
  matricula: number;
  nome: string;
  email?: string | null;
  cpf: string;
  telefone?: string | null;
  status: StatusAluno;
  dataMatricula?: string | null;
  planoId?: string | null;
  vencimentoPlano?: string | null;
  plano?: Plano | null;
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  uf?: string | null;
  fotoBase64?: string | null;
  qrCode?: string | null;
}

interface FormState {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  status: StatusAluno;
  dataMatricula: string;
  planoId: string;
  vencimentoPlano: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  cidade: string;
  uf: string;
  fotoBase64: string;
}

const VAZIO: FormState = {
  nome: '',
  email: '',
  cpf: '',
  telefone: '',
  status: StatusAluno.ATIVO,
  dataMatricula: '',
  planoId: '',
  vencimentoPlano: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  fotoBase64: '',
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
  const [qrAtual, setQrAtual] = useState<string | null>(null);
  const [matriculaAtual, setMatriculaAtual] = useState<number | null>(null);
  const [erro, setErro] = useState<string>();
  const [salvando, setSalvando] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);

  /** Autopreenche o endereço pela API pública ViaCEP ao sair do campo CEP. */
  async function buscarCep(cep: string) {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = (await res.json()) as {
        logradouro?: string;
        bairro?: string;
        localidade?: string;
        uf?: string;
        erro?: boolean;
      };
      if (dados.erro) {
        setErro('CEP não encontrado.');
        return;
      }
      setForm((f) => ({
        ...f,
        logradouro: dados.logradouro ?? f.logradouro,
        bairro: dados.bairro ?? f.bairro,
        cidade: dados.localidade ?? f.cidade,
        uf: dados.uf ?? f.uf,
      }));
    } catch {
      setErro('Não foi possível consultar o CEP (verifique a conexão).');
    } finally {
      setBuscandoCep(false);
    }
  }

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
    setQrAtual(null);
    setMatriculaAtual(null);
    setErro(undefined);
  }

  function editar(a: AlunoRow) {
    setEditId(a.id);
    setQrAtual(a.qrCode ?? null);
    setMatriculaAtual(a.matricula);
    setErro(undefined);
    setForm({
      nome: a.nome,
      email: a.email ?? '',
      cpf: a.cpf,
      telefone: a.telefone ?? '',
      status: a.status,
      dataMatricula: a.dataMatricula ? a.dataMatricula.slice(0, 10) : '',
      planoId: a.planoId ?? '',
      vencimentoPlano: a.vencimentoPlano ? a.vencimentoPlano.slice(0, 10) : '',
      cep: a.cep ?? '',
      logradouro: a.logradouro ?? '',
      numero: a.numero ?? '',
      bairro: a.bairro ?? '',
      cidade: a.cidade ?? '',
      uf: a.uf ?? '',
      fotoBase64: a.fotoBase64 ?? '',
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
    // Prisma (DateTime) exige ISO completo; o input date entrega só AAAA-MM-DD.
    if (form.vencimentoPlano)
      payload.vencimentoPlano = new Date(`${form.vencimentoPlano}T00:00:00`).toISOString();
    if (form.cep) payload.cep = form.cep.replace(/\D/g, '');
    if (form.logradouro) payload.logradouro = form.logradouro;
    if (form.numero) payload.numero = form.numero;
    if (form.bairro) payload.bairro = form.bairro;
    if (form.cidade) payload.cidade = form.cidade;
    if (form.uf) payload.uf = form.uf.toUpperCase();
    if (form.fotoBase64) payload.fotoBase64 = form.fotoBase64;

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
    {
      header: 'Foto',
      render: (a) =>
        a.fotoBase64 ? (
          <img src={a.fotoBase64} alt={a.nome} className="checkin__foto" />
        ) : (
          '—'
        ),
    },
    { header: 'Matrícula', render: (a) => a.matricula },
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
        <div className="crud__form-grid" onKeyDown={avancarComEnter}>
          <AutocompleteField
            label="Nome"
            options={alunos.map((a) => a.nome)}
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
          <Field
            label="Vencimento do plano"
            type="date"
            value={form.vencimentoPlano}
            onChange={(e) => setForm({ ...form, vencimentoPlano: e.target.value })}
          />
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

        <div className="crud__panel-head">
          <h2 style={{ fontSize: '0.95rem' }}>Endereço</h2>
          {buscandoCep && <span className="crud__hint">Buscando CEP…</span>}
        </div>
        <div className="crud__form-grid" onKeyDown={avancarComEnter}>
          <Field
            label="CEP"
            value={form.cep}
            onChange={(e) => setForm({ ...form, cep: e.target.value })}
            onBlur={(e) => buscarCep(e.target.value)}
          />
          <Field
            label="Logradouro"
            value={form.logradouro}
            onChange={(e) => setForm({ ...form, logradouro: e.target.value })}
          />
          <Field
            label="Número"
            value={form.numero}
            onChange={(e) => setForm({ ...form, numero: e.target.value })}
          />
          <Field
            label="Bairro"
            value={form.bairro}
            onChange={(e) => setForm({ ...form, bairro: e.target.value })}
          />
          <Field
            label="Cidade"
            value={form.cidade}
            onChange={(e) => setForm({ ...form, cidade: e.target.value })}
          />
          <Field
            label="UF"
            maxLength={2}
            value={form.uf}
            onChange={(e) => setForm({ ...form, uf: e.target.value.toUpperCase() })}
          />
        </div>

        <div className="crud__form-grid">
          <div className="field">
            <span className="field__label">Foto do aluno</span>
            <CameraCapture
              value={form.fotoBase64 || undefined}
              onCapture={(dataUrl) => setForm((f) => ({ ...f, fotoBase64: dataUrl }))}
              onClear={() => setForm((f) => ({ ...f, fotoBase64: '' }))}
            />
          </div>
          {matriculaAtual != null && (
            <div className="field">
              <span className="field__label">Número de matrícula</span>
              <input className="field__control" value={matriculaAtual} readOnly />
              <span className="qr-code__hint">
                Informe este número na catraca quando o aluno não trouxer o QR.
              </span>
            </div>
          )}
          {qrAtual && (
            <div className="field">
              <span className="field__label">QR code de acesso (catraca)</span>
              <div className="qr-code">
                <QrCode value={qrAtual} alt="QR code do aluno" />
                <span className="qr-code__hint">
                  Apresente este QR na catraca para registrar a entrada.
                </span>
              </div>
            </div>
          )}
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
