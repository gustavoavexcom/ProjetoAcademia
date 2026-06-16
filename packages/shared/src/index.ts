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

// ----------------------------------------------------------------------------
// Contratos de entidade (DTOs base — refinar conforme o schema Prisma evolui)
// ----------------------------------------------------------------------------

export interface Aluno {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  status: StatusAluno;
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
}

// ----------------------------------------------------------------------------
// Constantes utilitárias
// ----------------------------------------------------------------------------

/** Prefixo padrão das rotas da API. */
export const API_PREFIX = 'api';
