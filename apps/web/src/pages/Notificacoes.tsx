import { useEffect, useState } from 'react';
import type { Notificacao } from '@academia/shared';
import { apiDelete, apiGet, apiPatch, apiPost } from '../api/client';
import { Button } from '../ui/Button';
import { AutocompleteField, Field, TextAreaField, avancarComEnter } from '../ui/Form';
import { DataTable, type Column } from '../ui/DataTable';

interface FormState {
  titulo: string;
  tipo: string;
  mensagem: string;
}

const VAZIO: FormState = { titulo: '', tipo: '', mensagem: '' };

// Tipos sugeridos no autocomplete (o usuário pode digitar outro livremente).
const TIPOS_PADRAO = ['Evento', 'Aviso', 'Lembrete', 'Promoção'];

const dataHora = (iso?: string) => (iso ? new Date(iso).toLocaleString('pt-BR') : '—');

export default function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [form, setForm] = useState<FormState>(VAZIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [erro, setErro] = useState<string>();
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    try {
      setNotificacoes(await apiGet<Notificacao[]>('/notificacoes'));
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

  function editar(n: Notificacao) {
    setEditId(n.id);
    setErro(undefined);
    setForm({ titulo: n.titulo, tipo: n.tipo, mensagem: n.mensagem });
  }

  async function salvar() {
    setSalvando(true);
    setErro(undefined);
    try {
      if (editId) await apiPatch(`/notificacoes/${editId}`, form);
      else await apiPost('/notificacoes', form);
      limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setSalvando(false);
    }
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta notificação?')) return;
    try {
      await apiDelete(`/notificacoes/${id}`);
      if (editId === id) limpar();
      await carregar();
    } catch (e) {
      setErro((e as Error).message);
    }
  }

  const colunas: Column<Notificacao>[] = [
    { header: 'Título', render: (n) => n.titulo },
    {
      header: 'Tipo',
      render: (n) => <span className="badge badge--blue">{n.tipo}</span>,
    },
    { header: 'Mensagem', render: (n) => n.mensagem },
    { header: 'Criada em', render: (n) => dataHora(n.criadoEm) },
    {
      header: 'Ações',
      render: (n) => (
        <div className="crud__actions">
          <Button variant="secondary" size="sm" onClick={() => editar(n)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => excluir(n.id)}>
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
          <h2>{editId ? 'Editar notificação' : 'Nova notificação'}</h2>
          <span className="crud__hint">
            Ex.: "Festa Junina" · tipo "Evento" · "Hoje terá festa junina na academia".
          </span>
        </div>
        {erro && <div className="alert alert--error">{erro}</div>}
        <div className="crud__form-grid" onKeyDown={avancarComEnter}>
          <Field
            label="Nome / título"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
          />
          <AutocompleteField
            label="Tipo"
            options={TIPOS_PADRAO}
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          />
          <TextAreaField
            label="Mensagem"
            value={form.mensagem}
            onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
          />
        </div>
        <div className="crud__actions">
          <Button
            onClick={salvar}
            disabled={salvando || !form.titulo || !form.tipo || !form.mensagem}
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
          <h2>Notificações</h2>
          <span className="crud__hint">{notificacoes.length} registro(s)</span>
        </div>
        <DataTable columns={colunas} rows={notificacoes} empty="Nenhuma notificação." />
      </section>
    </div>
  );
}
