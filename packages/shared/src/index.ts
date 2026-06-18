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

/**
 * Objetivo de treino escolhido na avaliação física (MOD-07). Direciona a base
 * recomendada de exercícios, alimentação e suplementos.
 */
export enum ObjetivoTreino {
  /** Mais forte em cima — ênfase em membros superiores. */
  FORCA_SUPERIOR = 'FORCA_SUPERIOR',
  /** Mais forte embaixo — ênfase em membros inferiores. */
  FORCA_INFERIOR = 'FORCA_INFERIOR',
  /** Abdômen definido — ênfase em core e definição. */
  ABDOMEN_DEFINIDO = 'ABDOMEN_DEFINIDO',
}

/** Rótulos amigáveis dos objetivos de treino (para selects/relatórios). */
export const OBJETIVO_TREINO_ROTULOS: Record<ObjetivoTreino, string> = {
  [ObjetivoTreino.FORCA_SUPERIOR]: 'Mais forte em cima — membros superiores',
  [ObjetivoTreino.FORCA_INFERIOR]: 'Mais forte embaixo — membros inferiores',
  [ObjetivoTreino.ABDOMEN_DEFINIDO]: 'Abdômen definido',
};

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
  /** CEP do aluno (somente dígitos ou formatado). */
  cep?: string;
  /** Logradouro (rua/avenida) — autopreenchido via ViaCEP. */
  logradouro?: string;
  /** Número do endereço. */
  numero?: string;
  /** Bairro — autopreenchido via ViaCEP. */
  bairro?: string;
  /** Cidade — autopreenchido via ViaCEP. */
  cidade?: string;
  /** Unidade federativa (sigla, 2 letras) — autopreenchido via ViaCEP. */
  uf?: string;
  /** Foto do aluno (data URL base64) capturada no cadastro. */
  fotoBase64?: string;
  /** Token único codificado no QR code do aluno (lido pela catraca). */
  qrCode?: string;
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
  /** Objetivo de treino definido pelo instrutor nesta avaliação. */
  objetivo?: ObjetivoTreino;
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

/** Resultado de um check-in/check-out feito pela catraca via leitura de QR code (MOD-08). */
export interface ResultadoCheckin {
  acesso: Acesso;
  aluno: Pick<Aluno, 'id' | 'nome' | 'fotoBase64' | 'status'>;
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
// IMC e recomendação (MOD-07)
// ----------------------------------------------------------------------------

/** Resultado do cálculo de IMC (Índice de Massa Corporal). */
export interface ResultadoImc {
  /** Valor do IMC arredondado a 1 casa decimal. */
  valor: number;
  /** Classificação OMS (ex.: "Peso normal", "Sobrepeso", "Obesidade"). */
  classificacao: string;
}

/** Recomendação curada de exercícios, alimentação e suplementos por objetivo. */
export interface Recomendacao {
  /** IMC calculado a partir de peso/altura informados (null se faltar dado). */
  imc: ResultadoImc | null;
  objetivo: ObjetivoTreino;
  exercicios: string[];
  alimentacao: string[];
  suplementos: string[];
}

// ----------------------------------------------------------------------------
// Constantes utilitárias
// ----------------------------------------------------------------------------

/** Prefixo padrão das rotas da API. */
export const API_PREFIX = 'api';
