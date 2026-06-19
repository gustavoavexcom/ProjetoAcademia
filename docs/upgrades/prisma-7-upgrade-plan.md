# Plano de Upgrade — Prisma 5.22 → 7.x

> Status: **DRAFT (aguardando aprovação para executar a Fase 1)**
> Autor: @aiox-master (Orion) · Data: 2026-06-19
> Escopo: `apps/api` (NestJS + Fastify + PostgreSQL)

## 1. Contexto

O banco reporta `prisma 5.22.0 → 7.8.0` disponível (duas majors de distância). A v7
introduz mudanças estruturais (driver adapter obrigatório, engine reescrito em
TypeScript, ESM-first, novo gerador de client). Por isso o upgrade é **incremental**:
`5 → 6` (baixo risco) e depois `6 → 7` (alto risco).

## 2. Análise de impacto no código atual

Superfície de API do Prisma usada (varredura em `apps/api/src`) — **pequena e estável**:

| Uso | Local | Sensível a breaking change? |
|-----|-------|------------------------------|
| `extends PrismaClient` | [prisma.service.ts:5](../../apps/api/src/prisma/prisma.service.ts#L5) | **SIM** — construtor passa a exigir `adapter` (v7) |
| `new Prisma.Decimal(...)` | [notas.service.ts:57](../../apps/api/src/notas/notas.service.ts#L57) | Import muda para o client gerado (v7) |
| `$queryRaw\`SELECT 1\`` | [app.service.ts:12](../../apps/api/src/app.service.ts#L12) | Não |
| `Decimal @db.Decimal(...)` (schema) | `schema.prisma` (8 campos) | Não (tipo mantido) |
| `ts-node` no seed | [package.json](../../apps/api/package.json) | Recomendado migrar para `tsx` (v7) |

**Não usamos** (bom — reduz risco): `$use`/middleware (removido na v7), `rejectOnNotFound`,
preview features, `$transaction` complexo, `Bytes`.

## 3. Fase 1 — Upgrade para Prisma 6 (BAIXO risco)

Objetivo: validar a base antes do salto maior. A v6 quase não tem breaking changes
para este projeto (Node ≥20 já satisfeito).

1. `pnpm --filter @academia/api add -D prisma@6 && pnpm --filter @academia/api add @prisma/client@6`
2. `pnpm --filter @academia/api prisma:generate`
3. `pnpm --filter @academia/api typecheck`
4. `pnpm --filter @academia/api exec prisma migrate status` (confirma conexão)
5. Subir a API e bater o healthcheck (`$queryRaw SELECT 1`).

**Critério de aceite:** typecheck verde, `Database schema is up to date`, API sobe e
conecta. Commit isolado: `chore(api): upgrade prisma 5 → 6`.

## 4. Fase 2 — Upgrade para Prisma 7 (ALTO risco)

### 4.1 Dependências
```
pnpm --filter @academia/api add @prisma/client@7 @prisma/adapter-pg pg
pnpm --filter @academia/api add -D prisma@7 @types/pg tsx
```

### 4.2 `schema.prisma` — novo gerador
```prisma
generator client {
  provider = "prisma-client"          // antes: prisma-client-js (será removido)
  output   = "../src/generated/prisma" // output agora é OBRIGATÓRIO
}
```
> `output` em `src/` para o tsc compilar junto. Adicionar o path gerado ao `.gitignore`.

### 4.3 `apps/api/prisma.config.ts` (novo, na raiz da api)
```ts
import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations', seed: 'tsx prisma/seed.ts' },
  datasource: { url: env('DATABASE_URL') },
});
```

### 4.4 `PrismaService` — driver adapter obrigatório
```ts
import { PrismaClient } from '../generated/prisma/client'; // muda o import
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  }
  // onModuleInit / onModuleDestroy permanecem
}
```

### 4.5 Ajustar imports do client gerado
- [notas.service.ts:57](../../apps/api/src/notas/notas.service.ts#L57): `Prisma.Decimal` passa a importar de `../generated/prisma/client`.
- Qualquer outro `from '@prisma/client'` → path gerado.

### 4.6 Riscos a validar (pontos de incerteza)
- **ESM × CommonJS:** o client v7 é ESM; NestJS compila CommonJS. Validar interop
  (sem `"type": "module"`); ajustar `tsconfig` (`moduleResolution`) se quebrar.
- **Connection pool:** o driver `pg` não tem timeout por padrão (v6 usava 5s).
  Avaliar `connectionTimeoutMillis` no adapter.
- **Decimal:** confirmar serialização JSON inalterada nas respostas (notas/planos/mensalidades).

**Critério de aceite:** typecheck verde, API sobe com adapter, healthcheck OK, CRUD de
notas (que usa Decimal) responde corretamente. Commit: `chore(api): upgrade prisma 6 → 7 (driver adapter pg)`.

## 5. Rollback
Cada fase é um commit isolado. Reverter = `git revert` do commit + `prisma generate`.
Schema do banco **não muda** (sem novas migrations), então rollback é só de código/deps.

## 6. Recomendação
Executar **Fase 1 agora** (segura, valida a base) e tratar a **Fase 2** como item
dedicado, idealmente com a API coberta por ao menos um teste e2e de smoke antes do salto.
