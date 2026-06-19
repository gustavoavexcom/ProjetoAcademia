# Implementação — 2026-06-18 — Cardápio sugerido na recomendação por objetivo

Registro do incremento entregue sobre o módulo de **recomendações** do Sistema de Academia
(Pro Ativa Gutha): além das diretrizes gerais de alimentação, a recomendação passou a entregar um
**cardápio concreto** — pratos específicos por refeição, ajustados ao objetivo de treino escolhido.

> Continuação direta de [implementacao-2026-06-18-avaliacao-imc-recomendacao.md](implementacao-2026-06-18-avaliacao-imc-recomendacao.md).
> Reaproveita o motor de recomendação já existente — sem novo módulo, sem migration, sem IA.

---

## 1. Visão geral

Antes deste incremento, a aba **Recomendação** (após calcular o IMC e escolher o objetivo) entregava
três listas: **Exercícios / Alimentação / Suplementos**. A alimentação era apenas **diretriz geral**
("priorizar proteína magra", "carboidratos complexos antes do treino"), sem dizer o que comer na
prática.

Agora a recomendação inclui um **cardápio sugerido**: uma lista de **refeição → pratos concretos**,
específica por objetivo. Exemplo, para *"Mais forte em cima — membros superiores"* (ganho de massa):

| Refeição | Sugestão |
|----------|----------|
| Café da manhã | Omelete de 3 ovos com queijo + aveia com banana e mel |
| Lanche da manhã | Iogurte natural com castanhas e uma fruta |
| Almoço | Filé de salmão grelhado + arroz integral + brócolis no vapor + salada verde |
| Pré-treino | Batata-doce cozida + frango grelhado desfiado |
| Pós-treino | Whey protein batido com banana |
| Jantar | Omelete ou filé de frango/tilápia + legumes no vapor + salada |

Cada objetivo tem o seu cardápio:
- **FORCA_SUPERIOR** — pratos ricos em proteína para ganho de massa (salmão, ovos, frango, brócolis).
- **FORCA_INFERIOR** — mais carboidrato para suportar o volume de pernas (carne vermelha, batata-doce, macarrão integral).
- **ABDOMEN_DEFINIDO** — foco em déficit/definição (claras, peixe branco, salada à vontade, porções menores).

Decisão de produto (confirmada com o solicitante):
- **Cardápio = base curada fixa no código** (determinística, sem custo, sem IA/API externa) — mesmo
  princípio das listas já existentes.

---

## 2. Banco de dados

**Sem alterações.** O cardápio é **derivado** do objetivo e montado sob demanda na API — não é
persistido. Nenhuma migration nesta entrega.

---

## 3. Camada compartilhada (`packages/shared`)

Em `packages/shared/src/index.ts`:

- Novo contrato **`ItemCardapio { refeicao, sugestao }`**.
- `interface Recomendacao` ganhou o campo **`cardapio: ItemCardapio[]`** (entre `alimentacao` e
  `suplementos`). `alimentacao` segue como diretriz geral; `cardapio` é o passo concreto.

---

## 4. Backend (NestJS + Prisma)

Tudo dentro do módulo `recomendacoes` já existente:

| Arquivo | Mudança |
|--------|---------|
| `recomendacoes.data.ts` | Novo mapa **`CARDAPIO_POR_OBJETIVO: Record<ObjetivoTreino, ItemCardapio[]>`** com os 3 cardápios curados (6 refeições cada) |
| `recomendacoes.service.ts` | `gerar()` agora inclui `cardapio: CARDAPIO_POR_OBJETIVO[dto.objetivo]` no retorno |

- O cardápio é selecionado **por objetivo** (não sofre o ajuste por faixa de IMC, diferente das listas
  de exercícios/alimentação/suplementos — ver "Fora de escopo").
- **Endpoints inalterados:** `POST /api/recomendacoes` apenas passou a devolver o campo `cardapio` no
  corpo da resposta. Sem mudança de contrato de entrada.

---

## 5. Frontend (React + Vite)

### 5.1. Aba Recomendação (`apps/web/src/pages/Avaliacao.tsx`)

- Abaixo da grade de Exercícios/Alimentação/Suplementos, novo bloco **"Cardápio sugerido"**
  (renderizado só quando `reco.cardapio.length > 0`): lista de itens com **refeição** em destaque e a
  **sugestão** de pratos ao lado.
- O aviso de orientação geral ("não substitui instrutor/nutricionista") foi mantido logo abaixo.

### 5.2. CSS (`apps/web/src/ui/ui.css`)

- Novas classes `.reco-cardapio`, `.reco-cardapio__refeicao`, `.reco-cardapio__sugestao` — layout em
  grade (refeição | sugestão) sobre os tokens de marca existentes (`--surface-alt`, `--brand-blue`).

---

## 6. Como rodar

```bash
pnpm install
pnpm dev        # API (http://localhost:3000/api) + Web (http://localhost:5173)
```

**No navegador (http://localhost:5173):**
- **Avaliação & Recomendação** → buscar aluno por CPF → aba **Recomendação** → escolher
  *"Mais forte em cima — membros superiores"* → **Gerar recomendação** → o bloco **Cardápio sugerido**
  aparece com os pratos (salmão, brócolis, omelete, etc.).

> Não requer migration nem `prisma generate` — é só código de aplicação.

---

## 7. Verificação realizada

- `tsc --noEmit` ✅ em **shared + api + web**; `build` do shared ✅.
- `jest recomendacoes` ✅ — **8 testes** (7 anteriores + 1 novo): o teste novo valida que o cardápio
  vem preenchido, que todo item tem `refeicao` e `sugestao`, e que o almoço de membros superiores
  prioriza salmão.

---

## 8. LGPD e limites

- O cardápio é **orientação geral** e não substitui acompanhamento de instrutor/nutricionista (aviso
  mantido na UI). Não envolve novo dado pessoal.

---

## 9. Fora de escopo desta iteração

- **Cardápio variando por faixa de IMC** (ex.: porções maiores para quem está abaixo do peso) — hoje
  varia só por objetivo.
- **Suplementos detalhados por marca/dosagem** — mantida a lista curada atual.
- Cardápio **editável por tela/CRUD** ou **gerado por IA** — mantida a base curada fixa.
- **Persistência** do cardápio (é derivado e montado sob demanda).
