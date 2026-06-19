import { useEffect, useMemo, useState } from 'react';
import type { Agendamento, Funcionario } from '@academia/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { AutocompleteField, Field, TextAreaField, avancarComEnter } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';
import './Agenda.css';

interface FormState {
  nome: string;
  data: string; // datetime-local (YYYY-MM-DDTHH:mm)
  atendente: string;
  observacao: string;
}

const VAZIO: FormState = { nome: '', data: '', atendente: '', observacao: '' };

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

/** Chave AAAA-MM-DD em horário local (para agrupar agendamentos por dia). */
function chaveDia(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dia}`;
}

const dataHora = (iso: string) => new Date(iso).toLocaleString('pt-BR');

export default function Agenda() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [form, setForm] = useState<FormState>(VAZIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [erro, setErro] = useState<string>();
  const [salvando, setSalvando] = useState(false);

  // Mês exibido no calendário (1º dia do mês corrente por padrão).
  const hoje = new Date();
  const [mesView, setMesView] = useState(new Date(hoje.getFullYear(), hoje.getMonth(), 1));

  async function carregar() {
    try {
      const [ag, fn] = await Promise.all([
        apiGet<Agendamento[]>('/agendamentos'),
        apiGet<Funcionario[]>('/funcionarios'),
      ]);
      setAgendamentos(ag);
      setFuncionarios(fn);
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

  function editar(a: Agendamento) {
    setEditId(a.id);
    setErro(undefined);
    const d = new Date(a.data);
    // Converte para o formato aceito pelo input datetime-local (horário local).
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setForm({ nome: a.nome, data: local, atendente: a.atendente, observacao: a.observacao ?? '' });
  }

  async function salvar() {
    setSalvando(true);
    setErro(undefined);
    const payload = {
      nome: form.nome,
      data: new Date(form.data).toISOString(),
      atendente: form.atendente,
      observacao: form.observacao || undefined,
    };
    try {
      if (editId) await apiPatch(`/agendamentos/${editId}`, payload);
      else await apiPost('/agendamentos', payload);
      limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este agendamento?')) return;
    try {
      await apiDelete(`/agendamentos/${id}`);
      if (editId === id) limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  /** Ao clicar num dia do calendário, pré-preenche a data do formulário (08:00). */
  function selecionarDia(dia: Date) {
    const local = new Date(dia.getTime() - dia.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 11);
    setForm((f) => ({ ...f, data: `${local}08:00` }));
  }

  // Agrupa agendamentos por dia (AAAA-MM-DD) para pintar o calendário.
  const porDia = useMemo(() => {
    const mapa = new Map<string, Agendamento[]>();
    for (const a of agendamentos) {
      const k = chaveDia(new Date(a.data));
      (mapa.get(k) ?? mapa.set(k, []).get(k)!).push(a);
    }
    return mapa;
  }, [agendamentos]);

  // Monta a grade do mês (com células vazias antes do 1º dia para alinhar a semana).
  const celulas = useMemo(() => {
    const ano = mesView.getFullYear();
    const mes = mesView.getMonth();
    const primeiro = new Date(ano, mes, 1).getDay();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const arr: (Date | null)[] = [];
    for (let i = 0; i < primeiro; i++) arr.push(null);
    for (let d = 1; d <= totalDias; d++) arr.push(new Date(ano, mes, d));
    return arr;
  }, [mesView]);

  const chaveHoje = chaveDia(hoje);

  const colunas: Column<Agendamento>[] = [
    { header: 'Agendamento', render: (a) => a.nome },
    { header: 'Data/hora', render: (a) => dataHora(a.data) },
    { header: 'Atende', render: (a) => a.atendente },
    { header: 'Observação', render: (a) => a.observacao ?? '—' },
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
          <h2>{editId ? 'Editar agendamento' : 'Novo agendamento'}</h2>
          <span className="crud__hint">Nome, data e a pessoa que vai atender.</span>
        </div>
        {erro && <div className="alert alert--error">{erro}</div>}
        <div className="crud__form-grid" onKeyDown={avancarComEnter}>
          <Field
            label="Nome / descrição"
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
          />
          <Field
            label="Data e hora"
            type="datetime-local"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
          />
          <AutocompleteField
            label="Pessoa que vai atender"
            options={funcionarios.map((f) => f.nome)}
            value={form.atendente}
            onChange={(e) => setForm({ ...form, atendente: e.target.value })}
          />
          <TextAreaField
            label="Observação"
            value={form.observacao}
            onChange={(e) => setForm({ ...form, observacao: e.target.value })}
          />
        </div>
        <div className="crud__actions">
          <Button
            onClick={salvar}
            disabled={salvando || !form.nome || !form.data || !form.atendente}
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
          <h2>
            {MESES[mesView.getMonth()]} de {mesView.getFullYear()}
          </h2>
          <div className="crud__actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setMesView(new Date(mesView.getFullYear(), mesView.getMonth() - 1, 1))
              }
            >
              ◀ Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setMesView(new Date(hoje.getFullYear(), hoje.getMonth(), 1))}
            >
              Hoje
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setMesView(new Date(mesView.getFullYear(), mesView.getMonth() + 1, 1))
              }
            >
              Próximo ▶
            </Button>
          </div>
        </div>
        <div className="calendario">
          {DIAS_SEMANA.map((d) => (
            <div key={d} className="calendario__cabecalho">
              {d}
            </div>
          ))}
          {celulas.map((dia, i) => {
            if (!dia) return <div key={`v${i}`} className="calendario__vazio" />;
            const k = chaveDia(dia);
            const itens = porDia.get(k) ?? [];
            const ehHoje = k === chaveHoje;
            // Vermelho: dia de hoje que possui agendamento. Demais dias ficam em branco.
            const classe = [
              'calendario__dia',
              ehHoje ? 'calendario__dia--hoje' : '',
              ehHoje && itens.length > 0 ? 'calendario__dia--alerta' : '',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={k}
                type="button"
                className={classe}
                onClick={() => selecionarDia(dia)}
                title="Clique para agendar neste dia"
              >
                <span className="calendario__numero">{dia.getDate()}</span>
                {itens.map((a) => (
                  <span key={a.id} className="calendario__evento" title={`${a.nome} · ${a.atendente}`}>
                    {a.nome}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
      </section>

      <section className="crud__panel">
        <div className="crud__panel-head">
          <h2>Agendamentos</h2>
          <span className="crud__hint">{agendamentos.length} registro(s)</span>
        </div>
        <DataTable columns={colunas} rows={agendamentos} empty="Nenhum agendamento." />
      </section>
    </div>
  );
}
