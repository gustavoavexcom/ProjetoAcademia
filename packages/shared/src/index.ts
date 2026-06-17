/**
 * Tipos e contratos de domínio compartilhados entre API, Web e (futuro) Mobile.
 * Fonte dos requisitos: CLAUDE.md / docs/rastreabilidade-requisitos.md
 */

// ----------------------------------------------------------------------------
// Enums de domínio
// ----------------------------------------------------------------------------

/** Situação cadastral do aluno (MOD-01). */
export enum StatusAluno {
  ATIVO = 'ATIVO',
  INATIVO = 'INATIVO',
  SUSPENSO = 'SUSPENSO',
  TRANCADO = 'TRANCADO',
  CANCELADO = 'CANCELADO',
}

/** Situação de uma mensalidade (MOD-04). */
export enum StatusMensalidade {
  PENDENTE = 'PENDENTE',
  PAGA = 'PAGA',
  VENCIDA = 'VENCIDA',
  CANCELADA = 'CANCELADA',
}

/** Tipo de registro de acesso na catraca (MOD-08). */
export enum TipoAcesso {
  ENTRADA = 'ENTRADA',
  SAIDA = 'SAIDA',
}

/** Situação de uma nota fiscal de serviço (MOD-05). */
export enum StatusNota {
  EMITIDA = 'EMITIDA',
  CANCELADA = 'CANCELADA',
}

// ----------------------------------------------------------------------------
// Contratos de entidade (DTOs base — refinar conforme o schema Prisma evolui)
// ----------------------------------------------------------------------------

export interface Aluno {
  id: string;
  nome: string;
  email?: string;
  cpf: string;
  telefone?: string;
  status: StatusAluno;
  dataMatricula?: string;
  planoId?: string;
  criadoEm: string;
}

export interface Plano {
  id: string;
  nome: string;
  valorMensal: number;
  descricao?: string;
  ativo: boolean;
}

export interface Mensalidade {
  id: string;
  alunoId: string;
  planoId: string;
  competencia: string; // formato AAAA-MM
  valor: number;
  vencimento: string;
  status: StatusMensalidade;
  pagoEm?: string;
}

export interface AvaliacaoFisica {
  id: string;
  alunoId: string;
  data: string;
  pesoKg?: number;
  alturaCm?: number;
  percentualGordura?: number;
  massaMuscularKg?: number;
  observacoes?: string;
}

export interface ExercicioTreino {
  id: string;
  treinoId: string;
  nome: string;
  series?: number;
  repeticoes?: string;
  cargaKg?: number;
}

export interface Treino {
  id: string;
  nome: string;
  objetivo?: string;
  instrutor?: string;
  alunoId?: string;
  exercicios?: ExercicioTreino[];
}

export interface Acesso {
  id: string;
  alunoId: string;
  tipo: TipoAcesso;
  registro: string;
}

export interface NotaFiscal {
  id: string;
  alunoId: string;
  mensalidadeId?: string;
  numero: string;
  protocolo: string;
  valor: number;
  descricaoServico: string;
  status: StatusNota;
  emitidaEm: string;
}

// ----------------------------------------------------------------------------
// Constantes utilitárias
// ----------------------------------------------------------------------------

/** Prefixo padrão das rotas da API. */
export const API_PREFIX = 'api';
