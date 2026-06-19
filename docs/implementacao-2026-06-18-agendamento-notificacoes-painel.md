# Implementação — 2026-06-18 — Agendamento, Notificações e Painel de Avisos

Registro do que foi entregue nesta iteração do Sistema de Academia (Pro Ativa Gutha):
módulo de **Agendamento** com calendário do mês, módulo de **Notificações** e um **painel de
avisos** no lado direito da tela principal (Dashboard) que consolida notificações e vencimentos de
**plano** e **mensalidade** com código de cores (verde = a vencer / vermelho = vencido).

---

## 1. Visão geral

Antes desta iteração os módulos **Agendamento** e **Notificações** existiam apenas na navegação
(caíam no "em construção"), e a tela principal não exibia nenhum alerta operacional. Agora:

- **Agendamento**: a recepção cria um compromisso com **nome, data/hora e a pessoa que vai
  atender**. A aba mostra o **calendário do mês atual**; o dia de **hoje com agendamento aparece em
  vermelho**, e os demais dias ficam em branco e clicáveis (clicar pré-preenche a data no formulário).
- **Notificações**: cadastro de avisos com **nome (título), tipo e mensagem**
  (ex.: "Festa Junina" / "Evento" / "Hoje terá festa junina na academia").
- **Tela principal (Dashboard)**: ganhou uma **coluna de avisos à direita** que mostra:
  - as **notificações** divulgadas;
  - **avisos de vencimento de plano** — **verde** quando está próximo de vencer, **vermelho**
    quando já venceu e o aluno não renovou;
  - **avisos de mensalidade** — **verde** quando vai vencer (próximos dias), **vermelho** quando
    está em atraso (cobre também o aluno que paga em dinheiro todo mês).

Decisões de produto desta entrega:
- **Pessoa que atende = texto livre** com autocomplete dos funcionários cadastrados (não obriga
  vínculo rígido com a tabela de funcionários).
- **Vencimento de plano = data por aluno** (`vencimentoPlano`), definida no cadastro do aluno —
  é a fonte do aviso verde/vermelho de plano.
- **Painel = somente leitura e informativo**: se a API falhar, a tela não quebra (mostra vazio).

---

## 2. Banco de dados

### Schema (Prisma — `apps/api/prisma/schema.prisma`)

Migration **`20260618140000_agenda_notificacoes`** (aplicada com `prisma migrate deploy`).
Mudanças:

- **Novo modelo `Agendamento`** (MOD-09): `nome`, `data` (DateTime), `atendente`, `observacao?`,
  `criadoEm`, `atualizadoEm`. Índice em `data` para montar o calendário.
- **Novo modelo `Notificacao`** (MOD-10): `titulo`, `tipo`, `mensagem`, `criadoEm`, `atualizadoEm`.
- **Aluno**: novo campo **`vencimentoPlano` (DateTime?)** — data-limite de validade/renovação do
  plano contratado (ex.: plano anual). Nulável, não quebra os alunos já cadastrados.

> Por ser ambiente **não-interativo**, a migration foi aplicada com `prisma migrate deploy` (mesmo
> padrão das entregas anteriores). Todas as colunas novas são nuláveis — sem backfill necessário.

---

## 3. Camada compartilhada (`packages/shared`)

Fonte única de tipos para API e Web (`packages/shared/src/index.ts`):

- `interface Aluno` ganhou `vencimentoPlano?: string`.
- Novos contratos:
  - `Agendamento { id, nome, data, atendente, observacao?, criadoEm? }`
  - `Notificacao { id, titulo, tipo, mensagem, criadoEm? }`
  - `type CorAviso = 'verde' | 'vermelho'`
  - `AvisoPainel { id, categoria: 'PLANO' | 'MENSALIDADE', aluno, descricao, cor, data }`
  - `PainelAvisos { notificacoes: Notificacao[], avisos: AvisoPainel[] }`

---

## 4. Backend (NestJS + Prisma)

### 4.1. Módulo `agendamentos` (MOD-09)

Pasta `apps/api/src/agendamentos/`, registrada no `AppModule`. CRUD completo seguindo o padrão dos
demais módulos (service usa `PrismaService` + `traduzErroPrisma`).

| Arquivo | Papel |
|--------|-------|
| `agendamentos.service.ts` | `create`/`findAll`/`findOne`/`update`/`remove`; converte `data` para `Date` |
| `agendamentos.controller.ts` | Rotas REST padrão |
| `dto/create-agendamento.dto.ts` | `nome` (`@MinLength(2)`), `data` (`@IsDateString`), `atendente` (`@MinLength(2)`), `observacao?` |
| `dto/update-agendamento.dto.ts` | Versão parcial (todos opcionais) |

### 4.2. Módulo `notificacoes` (MOD-10) + painel de avisos

Pasta `apps/api/src/notificacoes/`, registrada no `AppModule`. Além do CRUD, expõe a rota agregada
do painel da tela principal.

| Arquivo | Papel |
|--------|-------|
| `notificacoes.service.ts` | CRUD + **`painel()`**: agrega notificações + avisos de plano + avisos de mensalidade |
| `notificacoes.controller.ts` | CRUD + `GET /notificacoes/painel` (declarada **antes** de `:id` para não conflitar) |
| `dto/create-notificacao.dto.ts` | `titulo`, `tipo`, `mensagem` (todos `@MinLength(2)`) |
| `dto/update-notificacao.dto.ts` | Versão parcial (todos opcionais) |

**Regras do `painel()`** (cores conforme o pedido):

- **Plano** (a partir de `Aluno.vencimentoPlano`, apenas alunos `ATIVO`):
  - vencimento **no passado** → **vermelho** ("Plano venceu há N dia(s) e não foi renovado").
  - vencimento dentro dos **próximos 30 dias** → **verde** ("Plano vence em N dia(s)" / "vence hoje").
- **Mensalidade** (a partir de `Mensalidade` `PENDENTE`/`VENCIDA`):
  - vencimento **no passado** → **vermelho** ("Mensalidade AAAA-MM vencida há N dia(s)").
  - vencimento dentro dos **próximos 7 dias** → **verde** ("vence em N dia(s)" / "vence hoje").

> A comparação usa a **meia-noite de hoje** como referência (helpers `inicioDeHoje` e `diasAte` no
> service), para classificar por dia inteiro independentemente da hora.

### 4.3. Aluno aceita `vencimentoPlano`

- `dto/create-aluno.dto.ts` e `dto/update-aluno.dto.ts` ganharam `vencimentoPlano?`
  (`@IsOptional() @IsDateString`); o `AlunosService` já persiste o DTO direto.

### Endpoints novos/alterados

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST/GET/GET:id/PATCH:id/DELETE:id` | `/api/agendamentos` | CRUD de agendamentos |
| `POST/GET/GET:id/PATCH:id/DELETE:id` | `/api/notificacoes` | CRUD de notificações |
| `GET` | `/api/notificacoes/painel` | Painel agregado `{ notificacoes, avisos }` da tela principal |
| `POST` / `PATCH` | `/api/alunos` | Agora aceitam `vencimentoPlano` no corpo |

---

## 5. Frontend (React + Vite)

### 5.1. Nova página "Agendamento" (`apps/web/src/pages/Agenda.tsx` + `Agenda.css`)

- **Formulário**: nome/descrição, **data e hora** (`datetime-local`), **pessoa que vai atender**
  (`AutocompleteField` com os funcionários) e observação. Editar/excluir via tabela.
- **Calendário do mês atual**: grade de 7 colunas (dom–sáb) com as células do mês.
  - Dia de **hoje com agendamento → vermelho** (`.calendario__dia--alerta`).
  - Demais dias ficam **em branco** e clicáveis — clicar **pré-preenche a data** do formulário (08:00).
  - Cada dia lista os agendamentos do dia; navegação **Anterior / Hoje / Próximo**.
- **Tabela** com todos os agendamentos (nome, data/hora, atende, observação, ações).

### 5.2. Nova página "Notificações" (`apps/web/src/pages/Notificacoes.tsx`)

- Formulário com **nome (título)**, **tipo** (autocomplete: Evento, Aviso, Lembrete, Promoção — ou
  texto livre) e **mensagem**. CRUD completo com tabela (título, tipo, mensagem, criada em, ações).

### 5.3. Tela principal — painel de avisos (`apps/web/src/pages/Dashboard.tsx` + `Dashboard.css`)

- Layout passou a **2 colunas**: conteúdo principal à esquerda e uma **coluna de avisos à direita**
  (`.rail`), que consome `GET /notificacoes/painel` no carregamento.
- **Bloco "Notificações"**: cards das notificações divulgadas (borda azul).
- **Bloco "Avisos de vencimento"**: cards de plano/mensalidade com **borda e fundo verde**
  (`.aviso--verde`) ou **vermelho** (`.aviso--vermelho`), com nome do aluno, descrição e data de
  vencimento.
- Em caso de falha da API o painel mostra estado vazio, sem quebrar a tela (é informativo).

### 5.4. Cadastro de aluno — vencimento do plano (`apps/web/src/pages/Alunos.tsx`)

- Novo campo **"Vencimento do plano"** (`type="date"`) ao lado do plano. No envio, a data é
  convertida para **ISO completo** antes do `POST/PATCH`, porque o Prisma (DateTime) **rejeita data
  sem hora** (`AAAA-MM-DD`).

### 5.5. Roteamento

- `App.tsx`: páginas `Agenda` e `Notificacoes` adicionadas ao mapa `PAGINAS` (`agenda`,
  `notificacoes`). As entradas de navegação já existiam em `layout/navigation.tsx`
  (ícones `IconCalendar` e `IconBell`).

### CSS

- `apps/web/src/pages/Agenda.css`: classes do calendário (`.calendario`, `.calendario__dia`,
  `.calendario__dia--alerta`, `.calendario__evento`).
- `apps/web/src/pages/Dashboard.css`: layout em 2 colunas (`.dashboard__main`, `.rail`) e cards de
  aviso (`.aviso`, `.aviso--verde`, `.aviso--vermelho`), apoiados nos tokens de marca existentes.

---

## 6. Como rodar

```bash
pnpm install

# Banco (PostgreSQL ativo; configure apps/api/.env)
pnpm --filter @academia/api prisma:generate
pnpm --filter @academia/api exec prisma migrate deploy   # aplica a migration desta entrega

pnpm dev        # API (http://localhost:3000/api) + Web (http://localhost:5173)
```

**No navegador (http://localhost:5173):**
- **Agendamento** → criar um compromisso para hoje e ver o dia destacado em **vermelho** no
  calendário; clicar em outro dia pré-preenche a data.
- **Notificações** → cadastrar "Festa Junina" / "Evento" / mensagem.
- **Alunos** → editar um aluno e definir o **vencimento do plano**.
- **Dashboard** → conferir, na coluna da direita, a notificação e os avisos de plano/mensalidade
  em verde/vermelho.

---

## 7. Verificação realizada

- `pnpm --filter @academia/api typecheck` ✅ e `pnpm --filter @academia/web typecheck` ✅.
- **Smoke test** com a API no ar:
  - `GET /api/agendamentos` e `GET /api/notificacoes/painel` → OK.
  - `POST /api/notificacoes` ("Festa Junina") e `POST /api/agendamentos` (hoje) → criados e
    refletidos no painel.
  - `PATCH /api/alunos/{id}` com `vencimentoPlano`:
    - vencimento em +10 dias → aviso **verde** ("Plano vence em N dia(s)");
    - vencimento em −3 dias → aviso **vermelho** ("Plano venceu há N dia(s) e não foi renovado").
  - Confirmado que o Prisma rejeita data sem hora (`AAAA-MM-DD`) e aceita ISO completo — daí a
    conversão no front.

> **Lint:** `pnpm lint` não executa neste repositório — `eslint` não está instalado (condição
> **pré-existente**, não introduzida por esta entrega). A checagem estática efetiva é o `typecheck`,
> que passou.

> **Prisma generate:** com o servidor de dev rodando, o `prisma generate` pode falhar ao renomear o
> *DLL nativo* do query engine (lock de arquivo). O binário é idêntico — é inofensivo. Para
> regenerar sem o aviso, pare o `pnpm dev` antes de rodar `prisma:generate`.

---

## 8. Fora de escopo desta iteração

- Vínculo rígido do agendamento com a tabela de funcionários (mantido texto livre com autocomplete).
- Disparo real de notificações (push/e-mail/SMS) — esta entrega cobre cadastro e exibição no painel.
- Geração automática de mensalidades a partir do vencimento do plano (são módulos independentes).
- Correção do mesmo padrão de data sem hora no campo `dataMatricula` (fragilidade **pré-existente**,
  fora do pedido).
