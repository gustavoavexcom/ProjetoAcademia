# Sistema de Academia — Projeto X

## Visão Geral

Sistema de gestão para academias, cobrindo o ciclo completo do aluno: cadastro, contratação de planos,
cobrança/financeiro, emissão fiscal, controle de acesso (catraca), montagem e acompanhamento de treinos,
avaliação física, agendamento de atividades e comunicação (notificações/lembretes).

**Usuários do sistema:**

| Perfil | Uso principal |
|--------|---------------|
| Recepção / Administração | Cadastros, financeiro, relatórios, emissão de NFS-e |
| Instrutores | Montagem de treinos, avaliações físicas, agenda de aulas |
| Alunos | Consulta de treinos, check-in, lembretes, situação financeira |

**Identidade visual:** usar a imagem `LogProativaGuTha.png` (raiz do projeto) como logo da tela principal.

---

## Stack Tecnológica

> Legenda: ✅ **decisão confirmada** · 🔎 **recomendação a validar** (não implementar como fato fechado
> sem confirmação — ver Artigo IV "No Invention" da Constitution AIOX em `.claude/CLAUDE.md`).

| Camada | Tecnologia | Status |
|--------|-----------|--------|
| Backend | Node.js + TypeScript | ✅ |
| Framework backend | NestJS (arquitetura modular) sobre adaptador Fastify | ✅ |
| Frontend Web | React + TypeScript (Vite) | ✅ |
| Mobile | PWA (reuso do web) primeiro; React Native/Expo no futuro | ✅ |
| Banco de dados | PostgreSQL | ✅ |
| ORM / acesso a dados | Prisma | ✅ |
| Gerenciador de pacotes / monorepo | pnpm workspaces | ✅ |

**Plataformas-alvo:** Web (desktop, recepção/administração) e Mobile (alunos/instrutores).

---

## Arquitetura & Estrutura de Pastas

Monorepo pnpm (criado — scaffold inicial):

```
apps/
  api/        # backend NestJS + Prisma (PostgreSQL)
  web/        # frontend React + Vite (PWA)
packages/
  shared/     # tipos e contratos de domínio compartilhados (web/api/mobile)
docs/         # PRD, stories, arquitetura e rastreabilidade
```

> O scaffolding do framework AIOX (`.aiox-core/`, `.claude/`) é infraestrutura de orquestração — **não**
> é código do produto. Não confundir com a aplicação.

---

## Módulos de Domínio

| Módulo | Responsabilidades |
|--------|-------------------|
| **Aluno** | Cadastrar, alterar, consultar e excluir alunos |
| **Funcionários / Instrutores** | Cadastro de funcionários e instrutores |
| **Plano** | Cadastrar plano, definir valor mensal, vincular plano ao aluno, controlar vencimento |
| **Financeiro** | Gerar mensalidades, registrar pagamentos, consultar inadimplentes |
| **Fiscal** | Emitir NFS-e, consultar notas emitidas |
| **Treino** | Cadastrar treino, atribuir ao aluno, acompanhar evolução |
| **Avaliação Física** | Registrar e acompanhar avaliações físicas dos alunos |
| **Acesso** | Registrar entrada/saída (check-in/check-out), controle de catraca |
| **Agendamento** | Agendar aulas e atividades |
| **Notificações** | Envio de notificações e lembretes aos alunos |
| **Relatórios** | Relatórios financeiros e de frequência |

---

## Requisitos Funcionais

O sistema deve permitir:

- Cadastro de alunos
- Cadastro de funcionários e instrutores
- Controle de planos e mensalidades
- Controle de pagamentos
- Registro de presença (check-in/check-out)
- Montagem e acompanhamento de treinos
- Avaliação física dos alunos
- Agendamento de aulas e atividades
- Controle de vencimento de planos
- Emissão de NFS-e e consulta de notas fiscais emitidas
- Emissão de relatórios financeiros e de frequência
- Envio de notificações e lembretes aos alunos

---

## Requisitos Não Funcionais

- **Usabilidade:** interface fácil de usar.
- **Segurança:** garantir a segurança dos dados dos usuários.
- **Backup:** possuir backup das informações.
- **Performance:** ser rápido no acesso e processamento.
- **Multiplataforma:** funcionar em computadores e/ou dispositivos móveis.
- **Disponibilidade:** estar disponível durante o horário de funcionamento da academia.
- **LGPD:** atender à Lei Geral de Proteção de Dados. Atenção especial a dados sensíveis —
  avaliações físicas (saúde) e dados financeiros exigem controle de acesso, minimização e
  consentimento.

---

## Casos de Uso Principais

1. Cadastrar aluno.
2. Contratar plano.
3. Gerar mensalidade.
4. Registrar pagamento.
5. Emitir nota fiscal (NFS-e).
6. Registrar acesso do aluno.
7. Cadastrar treino.
8. Emitir relatórios.

---

## Glossário de Domínio

| Termo | Significado |
|-------|-------------|
| **Aluno** | Cliente matriculado na academia |
| **Plano** | Pacote de serviços com valor mensal vinculado ao aluno |
| **Mensalidade** | Cobrança periódica gerada a partir do plano contratado |
| **Inadimplente** | Aluno com mensalidade vencida e não paga |
| **Vencimento de plano** | Data-limite de validade/renovação do plano do aluno |
| **NFS-e** | Nota Fiscal de Serviço eletrônica emitida pela academia |
| **Catraca** | Dispositivo físico de controle de entrada/saída |
| **Check-in / Check-out** | Registro de entrada e de saída do aluno |
| **Avaliação Física** | Medições e acompanhamento de saúde/evolução do aluno (dado sensível) |

---

## Convenções de Código

- **Idioma do código:** identificadores, nomes de arquivos e estruturas em **inglês**. Termos de
  domínio podem permanecer em pt-BR quando refletirem o negócio (ex.: `mensalidade`, `inadimplente`).
- **Comunicação e comentários:** em **português** (correto e acentuado).
- **TypeScript:** seguir boas práticas, tipagem explícita em fronteiras de módulo.
- **Commits:** conventional commits (`feat:`, `fix:`, `docs:`, `chore:` …) referenciando a story
  quando aplicável.
- **Padrões:** reutilizar componentes/utilitários existentes antes de criar novos; tratamento de
  erros abrangente; testes para novas funcionalidades.

---

## Comandos

Gerenciador: **pnpm** (workspaces). Rodar a partir da raiz do repositório.

```bash
pnpm install              # instala dependências de todo o monorepo

pnpm dev                  # sobe api + web em paralelo
pnpm dev:api              # só backend (NestJS) — http://localhost:3000/api
pnpm dev:web             # só frontend (Vite/PWA) — http://localhost:5173

pnpm build                # build de shared + apps
pnpm lint                 # lint em todos os pacotes
pnpm typecheck            # checagem de tipos em todos os pacotes
pnpm test                 # testes em todos os pacotes
```

**Banco de dados (Prisma — em `apps/api`):**

```bash
cp apps/api/.env.example apps/api/.env          # configurar DATABASE_URL
pnpm --filter @academia/api prisma:generate     # gerar o Prisma Client
pnpm --filter @academia/api prisma:migrate      # aplicar migrations
```

---

> **Nota:** as regras de orquestração de agentes, workflows e governança do framework AIOX ficam em
> `.claude/CLAUDE.md` e `.claude/rules/`. Este arquivo descreve o **produto** (Sistema de Academia).
