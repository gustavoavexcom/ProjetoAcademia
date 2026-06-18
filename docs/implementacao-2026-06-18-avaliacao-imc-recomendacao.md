# Implementação — 2026-06-18 — Avaliação física com IMC e recomendação (busca CPF/CEP)

Registro do que foi entregue nesta iteração do Sistema de Academia (Pro Ativa Gutha):
fluxo de **avaliação física orientada a objetivo**, com **busca de aluno por CPF**, cálculo de
**IMC**, **base curada de recomendações** (exercícios, alimentação e suplementos) e **endereço
com autopreenchimento por CEP** (ViaCEP) no cadastro de alunos.

---

## 1. Visão geral

Antes desta iteração a avaliação física era um simples registro de peso/altura/%gordura embutido
na tela de Treinos, sem IMC nem qualquer recomendação, e o aluno não tinha endereço. Agora:

- O instrutor **localiza o aluno digitando o CPF** e o cadastro aparece.
- A avaliação registra também um **objetivo** (mais forte em cima / embaixo / abdômen definido).
- O sistema calcula o **IMC** (faixas da OMS) e gera uma **recomendação curada** de exercícios,
  alimentação e suplementos, ajustada pela faixa de IMC.
- O cadastro do aluno ganhou **endereço completo**, autopreenchido pela API pública **ViaCEP**.
- Tudo isso vive em uma **tela dedicada** ("Avaliação & Recomendação"); a avaliação física saiu
  da tela de Treinos.

Decisões de produto (confirmadas com o solicitante):
- **Recomendações = base curada fixa no código** (determinística, sem custo, sem IA/API externa).
- **UI = página dedicada** (não embutida em Treinos).
- **Endereço = completo + ViaCEP**.

> **Sem API de CPF:** "buscar por CPF" consulta os **alunos já cadastrados** — não existe serviço
> público legal de dados pessoais por CPF. ViaCEP é pública e gratuita, usada só para endereço.

---

## 2. Banco de dados

### Schema (Prisma — `apps/api/prisma/schema.prisma`)

Migration **`20260618000000_avaliacao_objetivo_endereco`**. Mudanças:

- Novo **`enum ObjetivoTreino`**: `FORCA_SUPERIOR`, `FORCA_INFERIOR`, `ABDOMEN_DEFINIDO`.
- **Aluno**: novos campos de endereço **opcionais** — `cep`, `logradouro`, `numero`, `bairro`,
  `cidade`, `uf` (não quebram os 66 alunos já importados).
- **AvaliacaoFisica**: novo campo **`objetivo`** (`ObjetivoTreino?`).

> Por ser ambiente **não-interativo**, a migration foi gerada com `prisma migrate diff` e aplicada
> com `prisma migrate deploy` (mesmo padrão da entrega anterior). O SQL adiciona o type enum e as
> colunas — todas nuláveis, sem backfill necessário.

---

## 3. Camada compartilhada (`packages/shared`)

Fonte única de tipos para API e Web (`packages/shared/src/index.ts`):

- `enum ObjetivoTreino` + `OBJETIVO_TREINO_ROTULOS` (rótulos pt-BR para selects/relatórios).
- `interface Aluno` ganhou os campos de endereço.
- `interface AvaliacaoFisica` ganhou `objetivo?`.
- Novos contratos: `ResultadoImc { valor, classificacao }` e
  `Recomendacao { imc, objetivo, exercicios[], alimentacao[], suplementos[] }`.

---

## 4. Backend (NestJS + Prisma)

### 4.1. Busca por CPF (MOD-01)

- `apps/api/src/alunos/alunos.service.ts` → **`findByCpf(cpf)`**: normaliza para só dígitos
  (`replace(/\D/g, '')`), busca por `cpf` único (incluindo o plano) e lança **404** se não achar.
- `apps/api/src/alunos/alunos.controller.ts` → **`GET /api/alunos/cpf/:cpf`** (declarada antes de
  `:id` por clareza; não há conflito de profundidade de rota).
- DTO de Aluno: campos de endereço `@IsOptional() @IsString()` (UF com `@Length(2,2)`, CEP `8–9`).

### 4.2. IMC + Recomendação — novo módulo `recomendacoes`

Pasta `apps/api/src/recomendacoes/`, registrada no `AppModule`:

| Arquivo | Papel |
|--------|-------|
| `imc.util.ts` | `calcularImc(peso, altura)` (fórmula `peso/altura_m²`, 1 casa), `classificacaoImc`, `faixaImc` |
| `recomendacoes.data.ts` | **Base curada**: mapa `ObjetivoTreino → {exercicios, alimentacao, suplementos}` + ajustes por faixa de IMC |
| `recomendacoes.service.ts` | Calcula o IMC, escolhe a base do objetivo e **soma** os ajustes da faixa (sem duplicar) |
| `recomendacoes.controller.ts` | `GET /api/recomendacoes/objetivos` · `POST /api/recomendacoes` |
| `dto/gerar-recomendacao.dto.ts` | `objetivo` (`@IsEnum`), `pesoKg?`, `alturaCm?` |

**Classificação do IMC (OMS):** `< 18,5` Abaixo do peso · `18,5–24,9` Peso normal ·
`25–29,9` Sobrepeso · `≥ 30` Obesidade.

**Ajustes por faixa** (exemplos): IMC **abaixo** → superávit calórico / hipercalórico;
**sobrepeso** → + cardio e controle de carboidrato; **obesidade** → cardio de baixo impacto,
acompanhamento próximo e déficit orientado por nutricionista.

### 4.3. Avaliação grava o objetivo

- `apps/api/src/avaliacoes/dto/create-avaliacao.dto.ts` ganhou `objetivo?` (`@IsEnum(ObjetivoTreino)`);
  o service já persiste o DTO direto.

### Endpoints novos/alterados

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET`  | `/api/alunos/cpf/:cpf` | Localiza o aluno por CPF (com plano) — 404 se não existir |
| `GET`  | `/api/recomendacoes/objetivos` | Lista os objetivos `{ valor, rotulo }` |
| `POST` | `/api/recomendacoes` | Retorna IMC + listas curadas para `{ objetivo, pesoKg?, alturaCm? }` |
| `POST` | `/api/avaliacoes` | Agora aceita `objetivo` no corpo |

---

## 5. Frontend (React + Vite)

### 5.1. Nova página "Avaliação & Recomendação" (`apps/web/src/pages/Avaliacao.tsx`)

- **Topo — busca por CPF:** campo + botão "Buscar" (ou Enter) → `GET /alunos/cpf/...`; em sucesso
  exibe um **card read-only** do aluno (nome, CPF, telefone, plano, status) e carrega o histórico.
  CPF inexistente mostra alerta de erro.
- **Abas** (padrão `.tabs`):
  1. **Avaliação física** — peso, altura, % gordura, **objetivo**, observações; **IMC calculado ao
     vivo** no front; salva via `POST /avaliacoes`.
  2. **Recomendação** — seleciona o objetivo, "Gerar" → `POST /recomendacoes`; renderiza o IMC e as
     três listas (exercícios / alimentação / suplementos) + aviso de orientação geral.
  3. **Histórico** — `DataTable` das avaliações do aluno (`GET /avaliacoes?alunoId=`).
- Registrada na navegação: `NavKey 'avaliacao'` em `layout/navigation.tsx` e no mapa `PAGINAS` de
  `App.tsx` (ícone `IconChart`).

### 5.2. Endereço + ViaCEP no cadastro (`apps/web/src/pages/Alunos.tsx`)

- Novos campos `cep, logradouro, numero, bairro, cidade, uf`.
- `onBlur` do CEP → `fetch('https://viacep.com.br/ws/{cep}/json/')` (chamada direta do navegador)
  preenche logradouro/bairro/cidade/UF; trata `{ erro: true }` e falha de rede sem travar o form.

### 5.3. Limpeza no Treinos (`apps/web/src/pages/Treinos.tsx`)

- Removidos o formulário e a tabela de avaliação física (migraram para a nova tela); a página
  voltou a focar apenas em treinos/exercícios.

### CSS

- `apps/web/src/ui/ui.css`: novas classes `.aluno-card`, `.imc-box`, `.reco-grid`/`.reco-list`
  (apoiadas nos tokens de marca existentes).

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
- **Avaliação & Recomendação** → CPF `123.456.789-00` → registrar medidas → ver IMC → escolher
  objetivo → gerar recomendação; aba **Histórico** lista as avaliações.
- **Alunos** → digitar um CEP válido e sair do campo para o endereço autopreencher.

---

## 7. Verificação realizada

- `pnpm typecheck` ✅ (shared + api + web) e `pnpm build` ✅ (NestJS + Vite/PWA).
- `pnpm test` ✅ — **7 testes** unitários (`apps/api/src/recomendacoes/recomendacoes.service.spec.ts`):
  cálculo/ classificação de IMC, listagem de objetivos e montagem da recomendação com/sem ajuste de
  faixa. Config Jest (ts-jest) adicionada em `apps/api/jest.config.js`.
- **Smoke test** com a API no ar:
  - `GET /api/recomendacoes/objetivos` → 3 objetivos.
  - `POST /api/recomendacoes` (95 kg / 175 cm, força superior) → **IMC 31 / Obesidade** com os
    ajustes de obesidade somados às listas.
  - `GET /api/alunos/cpf/123.456.789-00` → aluno do seed (aceita CPF formatado);
    CPF inexistente → **404**.

> **Lint:** `pnpm lint` não executa neste repositório — `eslint` não está nas dependências
> (condição **pré-existente**, não introduzida por esta entrega). A checagem estática efetiva é o
> `typecheck`, que passou.

---

## 8. LGPD e limites

- Avaliação física é **dado sensível (saúde)**: o histórico só é exibido no contexto do aluno
  localizado por CPF; a tela mantém o aviso "Dado sensível (LGPD)".
- A recomendação é **orientação geral** e não substitui instrutor/nutricionista (aviso exibido na UI).

---

## 9. Fora de escopo desta iteração

- Recomendações editáveis por tela/CRUD (mantida a base curada fixa) e geração por IA.
- Persistência do IMC (é **derivado** e calculado sob demanda).
- Validação de dígito verificador de CPF (mantida a validação de formato existente).
