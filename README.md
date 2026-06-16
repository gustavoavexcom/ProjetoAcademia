# Sistema de Academia — Projeto X

Sistema de gestão para academias: alunos, planos/mensalidades, financeiro, fiscal (NFS-e),
treinos, avaliação física, controle de acesso (catraca), agendamento e notificações.

> Requisitos e visão completos em [`CLAUDE.md`](CLAUDE.md).
> Rastreabilidade em [`docs/rastreabilidade-requisitos.md`](docs/rastreabilidade-requisitos.md).

## Stack

- **Backend:** Node.js + TypeScript + **NestJS** + **Prisma**
- **Banco:** **PostgreSQL**
- **Frontend:** **React** + **Vite** (PWA)
- **Monorepo:** **pnpm** workspaces

## Estrutura

```
apps/
  api/        # backend NestJS + Prisma
  web/        # frontend React + Vite (PWA)
packages/
  shared/     # tipos/contratos de domínio compartilhados
docs/         # documentação e rastreabilidade
```

## Pré-requisitos

- Node.js >= 20
- pnpm >= 10
- PostgreSQL (local ou container)

## Começando

```bash
pnpm install

# backend: configurar banco
cp apps/api/.env.example apps/api/.env          # ajuste DATABASE_URL
pnpm --filter @academia/api prisma:generate
pnpm --filter @academia/api prisma:migrate

# rodar tudo
pnpm dev
```

- API: http://localhost:3000/api/health
- Web: http://localhost:5173

## Scripts principais

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Sobe api + web em paralelo |
| `pnpm dev:api` / `pnpm dev:web` | Sobe um app por vez |
| `pnpm build` | Build de shared + apps |
| `pnpm lint` / `pnpm typecheck` / `pnpm test` | Qualidade em todos os pacotes |

## Notas

- Os ícones PWA em `apps/web/public/icons/` são placeholders (cópias da logo). Gerar versões
  reais 192×192 e 512×512 antes de produção.
- `psql` local detectado é 9.6 (antigo); recomenda-se PostgreSQL 14+ para o servidor.
