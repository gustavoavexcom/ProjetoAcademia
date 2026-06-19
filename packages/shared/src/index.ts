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
  /** Número de matrícula sequencial (gerado no cadastro; usado no check-in sem QR). */
  matricula: number;
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
  /** Data-limite de validade/renovação do plano contratado (ex.: plano anual). */
  vencimentoPlano?: string;
  criadoEm: string;
}

/** Funcionário / instrutor da academia (MOD-02). */
export interface Funcionario {
  id: string;
  nome: string;
  cpf: string;
  /** Função na academia (ex.: Atendente, Professor, Personal). */
  funcao: string;
  /** Turno/horário de trabalho (texto livre; admite combinações). */
  turno?: string;
  criadoEm?: string;
}

/** Item do catálogo de exercícios e aparelhos (MOD-06). */
export interface Exercicio {
  id: string;
  nome: string;
  grupoMuscular: string;
  /** Aparelho/equipamento utilizado no exercício. */
  aparelho: string;
  criadoEm?: string;
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

/** Agendamento de aula/atividade (MOD-09). */
export interface Agendamento {
  id: string;
  /** Título/descrição do compromisso. */
  nome: string;
  /** Data e hora do agendamento (ISO). */
  data: string;
  /** Pessoa que vai atender (instrutor/atendente). */
  atendente: string;
  observacao?: string;
  criadoEm?: string;
}

/** Notificação/lembrete divulgado aos alunos (MOD-10). */
export interface Notificacao {
  id: string;
  /** Nome/título da notificação (ex.: "Festa Junina"). */
  titulo: string;
  /** Tipo/categoria (ex.: Evento, Aviso, Lembrete). */
  tipo: string;
  /** Mensagem completa exibida no painel. */
  mensagem: string;
  criadoEm?: string;
}

/** Cor do aviso no painel: verde = a vencer; vermelho = vencido/sem renovação. */
export type CorAviso = 'verde' | 'vermelho';

/** Aviso financeiro/contratual exibido no painel principal (MOD-10/MOD-04). */
export interface AvisoPainel {
  id: string;
  /** Origem do aviso. */
  categoria: 'PLANO' | 'MENSALIDADE';
  /** Nome do aluno relacionado. */
  aluno: string;
  /** Texto explicativo do aviso. */
  descricao: string;
  cor: CorAviso;
  /** Data de referência (vencimento) em ISO. */
  data: string;
}

/** Conteúdo agregado do painel de avisos da tela principal. */
export interface PainelAvisos {
  notificacoes: Notificacao[];
  avisos: AvisoPainel[];
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

/** Item do cardápio sugerido: uma refeição e a sugestão concreta de pratos. */
export interface ItemCardapio {
  /** Refeição do dia (ex.: "Almoço", "Pós-treino"). */
  refeicao: string;
  /** Sugestão concreta de alimentos para a refeição. */
  sugestao: string;
}

/** Recomendação curada de exercícios, alimentação e suplementos por objetivo. */
export interface Recomendacao {
  /** IMC calculado a partir de peso/altura informados (null se faltar dado). */
  imc: ResultadoImc | null;
  objetivo: ObjetivoTreino;
  exercicios: string[];
  /** Diretrizes gerais de alimentação. */
  alimentacao: string[];
  /** Cardápio concreto sugerido (pratos por refeição). */
  cardapio: ItemCardapio[];
  suplementos: string[];
}

// ----------------------------------------------------------------------------
// Constantes utilitárias
// ----------------------------------------------------------------------------

/** Prefixo padrão das rotas da API. */
export const API_PREFIX = 'api';
