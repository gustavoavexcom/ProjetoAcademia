# Matriz de Rastreabilidade de Requisitos — Sistema de Academia (Projeto X)

> Documento de rastreabilidade ligando **Requisitos → Módulos → Casos de Uso**.
> Fonte da verdade dos requisitos: [`CLAUDE.md`](../CLAUDE.md).
> Atualizar este documento sempre que um requisito, módulo ou caso de uso for adicionado/alterado/removido.

**Última atualização:** 2026-06-17

---

## 1. Módulos de Domínio

| ID | Módulo | Responsabilidades |
|----|--------|-------------------|
| MOD-01 | Aluno | Cadastrar, alterar, consultar e excluir alunos |
| MOD-02 | Funcionários / Instrutores | Cadastro de funcionários e instrutores |
| MOD-03 | Plano | Cadastrar plano, definir valor mensal, vincular ao aluno, controlar vencimento |
| MOD-04 | Financeiro | Gerar mensalidades, registrar pagamentos, consultar inadimplentes |
| MOD-05 | Fiscal | Emitir NFS-e, consultar notas emitidas |
| MOD-06 | Treino | Cadastrar treino, atribuir ao aluno, acompanhar evolução |
| MOD-07 | Avaliação Física | Registrar e acompanhar avaliações físicas (dado sensível) |
| MOD-08 | Acesso | Check-in/check-out, controle de catraca |
| MOD-09 | Agendamento | Agendar aulas e atividades |
| MOD-10 | Notificações | Envio de notificações e lembretes aos alunos |
| MOD-11 | Relatórios | Relatórios financeiros e de frequência |

---

## 2. Requisitos Funcionais (RF)

| ID | Requisito | Módulo(s) |
|----|-----------|-----------|
| RF-01 | Cadastro de alunos | MOD-01 |
| RF-02 | Cadastro de funcionários e instrutores | MOD-02 |
| RF-03 | Controle de planos e mensalidades | MOD-03, MOD-04 |
| RF-04 | Controle de pagamentos | MOD-04 |
| RF-05 | Registro de presença (check-in/check-out) | MOD-08 |
| RF-06 | Montagem e acompanhamento de treinos | MOD-06 |
| RF-07 | Avaliação física dos alunos | MOD-07 |
| RF-08 | Agendamento de aulas e atividades | MOD-09 |
| RF-09 | Controle de vencimento de planos | MOD-03 |
| RF-10 | Emissão de relatórios financeiros e de frequência | MOD-11 |
| RF-11 | Envio de notificações e lembretes aos alunos | MOD-10 |
| RF-12 | Emissão de NFS-e e consulta de notas fiscais emitidas | MOD-05 |

> Nota: no documento original, a emissão de NFS-e aparecia apenas como Módulo Fiscal e como Caso de Uso
> (emitir nota fiscal), faltando na lista "O sistema deve permitir". Foi promovida a requisito funcional
> de primeira classe (RF-12) no `CLAUDE.md` para fechar a rastreabilidade.

---

## 3. Requisitos Não Funcionais (RNF)

| ID | Requisito | Categoria |
|----|-----------|-----------|
| RNF-01 | Interface fácil de usar | Usabilidade |
| RNF-02 | Garantir segurança dos dados dos usuários | Segurança |
| RNF-03 | Possuir backup das informações | Confiabilidade |
| RNF-04 | Ser rápido no acesso e processamento | Performance |
| RNF-05 | Funcionar em computadores e/ou dispositivos móveis | Portabilidade |
| RNF-06 | Disponível durante o horário de funcionamento da academia | Disponibilidade |
| RNF-07 | Atender à LGPD (atenção a dados sensíveis: avaliação física e financeiros) | Conformidade |

---

## 4. Casos de Uso (UC)

| ID | Caso de Uso | Módulo(s) | RF relacionados |
|----|-------------|-----------|-----------------|
| UC-01 | Cadastrar aluno | MOD-01 | RF-01 |
| UC-02 | Contratar plano | MOD-03 | RF-03, RF-09 |
| UC-03 | Gerar mensalidade | MOD-04 | RF-03 |
| UC-04 | Registrar pagamento | MOD-04 | RF-04 |
| UC-05 | Emitir nota fiscal (NFS-e) | MOD-05 | RF-12 |
| UC-06 | Registrar acesso do aluno | MOD-08 | RF-05 |
| UC-07 | Cadastrar treino | MOD-06 | RF-06 |
| UC-08 | Emitir relatórios | MOD-11 | RF-10 |

---

## 5. Matriz de Rastreabilidade (Requisito Funcional × Caso de Uso)

| RF \ UC | UC-01 | UC-02 | UC-03 | UC-04 | UC-05 | UC-06 | UC-07 | UC-08 |
|---------|-------|-------|-------|-------|-------|-------|-------|-------|
| RF-01   | ✅ |   |   |   |   |   |   |   |
| RF-02   |   |   |   |   |   |   |   |   |
| RF-03   |   | ✅ | ✅ |   |   |   |   |   |
| RF-04   |   |   |   | ✅ |   |   |   |   |
| RF-05   |   |   |   |   |   | ✅ |   |   |
| RF-06   |   |   |   |   |   |   | ✅ |   |
| RF-07   |   |   |   |   |   |   |   |   |
| RF-08   |   |   |   |   |   |   |   |   |
| RF-09   |   | ✅ |   |   |   |   |   |   |
| RF-10   |   |   |   |   |   |   |   | ✅ |
| RF-11   |   |   |   |   |   |   |   |   |
| RF-12   |   |   |   |   | ✅ |   |   |   |

### Requisitos sem caso de uso principal (cobertura a planejar)

Os requisitos abaixo são válidos, mas ainda **não têm um caso de uso principal** na lista dos 8 fluxos
centrais. Devem ser cobertos por stories próprias na fase de desenvolvimento:

- **RF-02** — Cadastro de funcionários e instrutores
- **RF-07** — Avaliação física dos alunos
- **RF-08** — Agendamento de aulas e atividades
- **RF-11** — Envio de notificações e lembretes

---

## 6. Cobertura — Conferência

| Categoria | Total | Mapeados |
|-----------|-------|----------|
| Módulos (MOD) | 11 | 11 |
| Requisitos Funcionais (RF) | 12 | 12 |
| Requisitos Não Funcionais (RNF) | 7 | 7 |
| Casos de Uso (UC) | 8 | 8 |

✅ Todos os requisitos do `CLAUDE.md` original estão rastreados. Nenhum requisito foi perdido na
reescrita do `CLAUDE.md`.

---

## 7. Status de Implementação (2026-06-17)

Entrega full-stack dos módulos do núcleo + Fiscal/Treino/Avaliação/Acesso. Detalhes em
[`implementacao-2026-06-17.md`](./implementacao-2026-06-17.md).

| Módulo | RF | API | Tela | Status |
|--------|----|-----|------|--------|
| MOD-01 Aluno | RF-01 | `/api/alunos` (CRUD) | Alunos | ✅ Implementado |
| MOD-03 Plano | RF-03, RF-09 | `/api/planos` (CRUD) + vínculo no aluno | Planos | ✅ Implementado |
| MOD-04 Financeiro | RF-03, RF-04 | `/api/mensalidades` (gerar/pagar/inadimplentes) | Financeiro | ✅ Implementado |
| MOD-05 Fiscal | RF-12 | `/api/notas` (emitir/consultar/cancelar) | Fiscal | ✅ Implementado (NFS-e simulada) |
| MOD-06 Treino | RF-06 | `/api/treinos` (CRUD + atribuir) | Treinos | ✅ Implementado |
| MOD-07 Avaliação Física | RF-07 | `/api/avaliacoes` (CRUD) | Treinos (seção) | ✅ Implementado |
| MOD-08 Acesso | RF-05 | `/api/acessos` (registrar/histórico) | Acesso | ✅ Implementado |
| MOD-02 Funcionários | RF-02 | — | — | ⏳ Pendente |
| MOD-09 Agendamento | RF-08 | — | — | ⏳ Pendente |
| MOD-10 Notificações | RF-11 | — | — | ⏳ Pendente |
| MOD-11 Relatórios | RF-10 | — | — | ⏳ Pendente |

**Importação de dados:** 100 registros de `historico_academia.csv` normalizados → 66 alunos
(34 duplicados de CPF/CNPJ ignorados) e 13 planos distintos (seed em `apps/api/prisma/seed.ts`).
