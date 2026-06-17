# Implementação — 2026-06-17

Registro do que foi entregue nesta iteração do Sistema de Academia (Pro Ativa Gutha):
importação do histórico real de alunos e implementação **full-stack** (API NestJS + telas
React) dos módulos Aluno, Plano, Financeiro, Fiscal, Treino, Avaliação Física e Acesso.

---

## 1. Visão geral

Antes desta iteração existiam apenas o scaffold do monorepo, o CRUD de Alunos (API) e o
layout/Dashboard do frontend. Agora:

- O banco é **populado a partir de `historico_academia.csv`** (dados reais, normalizados).
- Todos os módulos do núcleo têm **API CRUD** e **tela com botões Salvar/Excluir**.
- A emissão de **NFS-e é simulada** (sem integração com a prefeitura).

---

## 2. Banco de dados e importação

### Schema (Prisma — `apps/api/prisma/schema.prisma`)

Migration `20260617000000_domain_expansion`. Mudanças:

- `enum StatusAluno` ganhou os valores **`TRANCADO`** e **`CANCELADO`** (presentes no CSV).
- **Aluno**: `email` passou a ser **opcional** (o CSV não traz e-mail); novos campos
  `dataMatricula` e `planoId` (**vínculo do plano ao aluno** — RF-03).
- Novos models: **`AvaliacaoFisica`**, **`Treino`** + **`ExercicioTreino`** (1-N, on delete cascade),
  **`NotaFiscal`** + `enum StatusNota` (EMITIDA/CANCELADA).
- `Plano.nome` passou a ser **único** (chave de deduplicação na importação).

### Importação (`apps/api/prisma/seed.ts`)

Os dados do CSV vêm "sujos"; o seed normaliza antes de gravar:

| Campo CSV | Tratamento |
|-----------|------------|
| CPF_CNPJ | Remove tudo que não é dígito; **deduplica** (mantém o 1º; ignora repetidos) |
| Telefone | Só dígitos; textos como "NÃO INFORMADO"/"SEM FONE"/"Nao tem"/"Falar com Assessoria" → `null` |
| Data Matrícula | Aceita `DD/MM/AAAA` e `DD-MM-AAAA` → `Date` |
| Status | Ativo/Inativo/Trancado/Cancelado → enum `StatusAluno` |
| Plano + Valor Mensal | Cria `Plano` único por nome (1º valor visto); vírgula decimal → ponto |
| E-mail | `null` (não existe no CSV) |

**Resultado da importação:** 100 linhas → **66 alunos** (34 duplicados de documento ignorados)
e **13 planos** distintos. O seed é **idempotente** (limpa as tabelas antes de reimportar).

---

## 3. Backend (NestJS + Prisma)

Todos os módulos seguem o padrão de `apps/api/src/alunos/` (controller + service + DTOs com
`class-validator`). Erros do Prisma são traduzidos por
`apps/api/src/common/prisma-error.ts` (P2002 → 409, P2025 → 404, P2003 → 409).

| Módulo | Rota base | Endpoints principais |
|--------|-----------|----------------------|
| Aluno | `/api/alunos` | `POST` · `GET` · `GET/:id` · `PATCH/:id` · `DELETE/:id` (inclui plano) |
| Plano | `/api/planos` | CRUD completo (define valor mensal, ativa/inativa) |
| Financeiro | `/api/mensalidades` | `POST /gerar` · `GET` · `GET /inadimplentes` · `PATCH /:id/pagar` · `DELETE /:id` |
| Fiscal | `/api/notas` | `POST /emitir` · `GET` · `GET /:id` · `PATCH /:id/cancelar` |
| Treino | `/api/treinos` | CRUD (exercícios aninhados) + `PATCH /:id/atribuir` |
| Avaliação | `/api/avaliacoes` | CRUD (filtro `?alunoId=`) |
| Acesso | `/api/acessos` | `POST` (ENTRADA/SAIDA) · `GET` (filtro `?alunoId=`) · `DELETE /:id` |

**Regras de negócio relevantes:**
- `POST /mensalidades/gerar` usa o **plano vinculado ao aluno** para definir o valor; vencimento =
  competência (`AAAA-MM`) + `diaVencimento` (padrão dia 10).
- `GET /mensalidades/inadimplentes` = mensalidades `PENDENTE`/`VENCIDA` com vencimento no passado.
- `POST /notas/emitir` gera `numero` (`NFSE-AAAA-NNNNNN`) e `protocolo` fictícios; herda o valor de
  uma mensalidade quando informada. **Simulado**, sem integração fiscal real.

---

## 4. Frontend (React + Vite)

- Infra reutilizável: cliente HTTP `src/api/client.ts`; componentes `src/ui/Button.tsx`,
  `src/ui/Form.tsx` (Field/Select/TextArea), `src/ui/DataTable.tsx`; estilos em `src/ui/ui.css`
  (apoiados nos tokens de marca já existentes).
- Roteamento por estado em `App.tsx` (mapa `NavKey → componente`); item **Fiscal (NFS-e)**
  adicionado à navegação. Módulos ainda não implementados continuam no `Placeholder`.
- Páginas (cada uma com formulário + tabela + **Salvar/Excluir**): **Alunos, Planos, Financeiro
  (com aba Inadimplentes), Fiscal, Treinos (com seção de Avaliação Física), Acesso**.

> Nota técnica: o `vite.config.ts` resolve `@academia/shared` direto do código-fonte TS, evitando
> falha do rollup ao detectar os enums exportados pelo bundle CommonJS.

---

## 5. Como rodar

```bash
pnpm install

# Banco (PostgreSQL precisa estar ativo; configure apps/api/.env)
pnpm --filter @academia/api prisma:migrate    # aplica migrations
pnpm --filter @academia/api prisma:seed       # importa o historico_academia.csv

pnpm dev        # sobe API (http://localhost:3000/api) + Web (http://localhost:5173)
```

> Em ambiente **não-interativo**, `prisma migrate dev` pode falhar (pede confirmação). Alternativa
> usada nesta entrega: gerar o SQL com `prisma migrate diff` e aplicar com `prisma migrate deploy`.

---

## 6. Verificação realizada

- `pnpm typecheck` e `pnpm build` (shared + api + web) sem erros.
- Smoke test contra o banco: listagem de alunos (66) e planos (13); fluxo de gerar mensalidade →
  registrar pagamento → emitir NFS-e → registrar acesso → criar treino com exercício — todos OK.

---

## 7. Fora de escopo desta iteração

Funcionários/Instrutores (MOD-02), Agendamento (MOD-09), Notificações (MOD-10) e Relatórios
(MOD-11). O campo `instrutor` do treino é texto livre, para não depender do cadastro de funcionários.
NFS-e permanece **simulada** (integração com prefeitura não faz parte deste escopo).
