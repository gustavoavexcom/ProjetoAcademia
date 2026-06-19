import { ObjetivoTreino, type ItemCardapio } from '@academia/shared';
import type { FaixaImc } from './imc.util';

/** Listas base de recomendação por objetivo de treino. */
interface BaseObjetivo {
  exercicios: string[];
  alimentacao: string[];
  suplementos: string[];
}

/**
 * Base curada (fixa) de recomendações por objetivo. Conteúdo de orientação geral —
 * não substitui acompanhamento de instrutor/nutricionista. Os ajustes por faixa de
 * IMC são aplicados em `ajustePorFaixa` e somados a estas listas.
 */
export const BASE_POR_OBJETIVO: Record<ObjetivoTreino, BaseObjetivo> = {
  [ObjetivoTreino.FORCA_SUPERIOR]: {
    exercicios: [
      'Supino reto com barra — 4x8-10',
      'Desenvolvimento militar (ombros) — 4x8-10',
      'Remada curvada — 4x8-12',
      'Puxada na barra fixa / pulldown — 4x8-12',
      'Rosca direta e tríceps na polia — 3x10-12',
    ],
    alimentacao: [
      'Priorizar proteína magra em todas as refeições (frango, ovos, peixe)',
      'Carboidratos complexos antes do treino (aveia, arroz integral, batata-doce)',
      'Refeição pós-treino com proteína + carboidrato em até 1h',
      'Hidratação adequada (35 ml por kg de peso/dia)',
    ],
    suplementos: [
      'Whey protein (apoio à ingestão proteica)',
      'Creatina monoidratada (3-5 g/dia)',
      'Cafeína pré-treino (opcional, conforme tolerância)',
    ],
  },
  [ObjetivoTreino.FORCA_INFERIOR]: {
    exercicios: [
      'Agachamento livre — 4x8-10',
      'Leg press 45° — 4x10-12',
      'Stiff / levantamento terra romeno — 4x8-10',
      'Cadeira extensora e flexora — 3x12',
      'Panturrilha em pé — 4x15-20',
    ],
    alimentacao: [
      'Aumentar carboidratos complexos para suportar o volume de pernas',
      'Proteína distribuída ao longo do dia (1,6-2,0 g por kg)',
      'Gorduras boas (azeite, castanhas, abacate) para suporte hormonal',
      'Hidratação reforçada nos dias de treino de inferiores',
    ],
    suplementos: [
      'Creatina monoidratada (3-5 g/dia)',
      'Whey protein (apoio à recuperação)',
      'Carboidrato de rápida absorção no pós-treino (opcional)',
    ],
  },
  [ObjetivoTreino.ABDOMEN_DEFINIDO]: {
    exercicios: [
      'Prancha frontal e lateral — 3x30-60s',
      'Abdominal supra e infra — 3x15-20',
      'Elevação de pernas suspenso — 3x12-15',
      'Cardio moderado/HIIT — 3-4x por semana',
      'Treino de força full-body para preservar massa magra',
    ],
    alimentacao: [
      'Déficit calórico leve e consistente (definição vem da dieta)',
      'Proteína alta para preservar massa magra (1,8-2,2 g por kg)',
      'Reduzir açúcares simples e ultraprocessados',
      'Priorizar fibras e vegetais para saciedade',
    ],
    suplementos: [
      'Whey protein (controle de saciedade e proteína)',
      'Cafeína (suporte ao gasto energético, conforme tolerância)',
      'Multivitamínico em fases de déficit calórico (opcional)',
    ],
  },
};

/**
 * Cardápio concreto sugerido por objetivo. Exemplos práticos de refeições —
 * orientação geral, não substitui acompanhamento de nutricionista.
 */
export const CARDAPIO_POR_OBJETIVO: Record<ObjetivoTreino, ItemCardapio[]> = {
  [ObjetivoTreino.FORCA_SUPERIOR]: [
    {
      refeicao: 'Café da manhã',
      sugestao: 'Omelete de 3 ovos com queijo + aveia com banana e mel',
    },
    {
      refeicao: 'Lanche da manhã',
      sugestao: 'Iogurte natural com castanhas e uma fruta',
    },
    {
      refeicao: 'Almoço',
      sugestao:
        'Filé de salmão grelhado + arroz integral + brócolis no vapor + salada verde',
    },
    {
      refeicao: 'Pré-treino',
      sugestao: 'Batata-doce cozida + frango grelhado desfiado',
    },
    {
      refeicao: 'Pós-treino',
      sugestao: 'Whey protein batido com banana',
    },
    {
      refeicao: 'Jantar',
      sugestao: 'Omelete ou filé de frango/tilápia + legumes no vapor + salada',
    },
  ],
  [ObjetivoTreino.FORCA_INFERIOR]: [
    {
      refeicao: 'Café da manhã',
      sugestao: 'Tapioca com ovo mexido + fruta + café',
    },
    {
      refeicao: 'Lanche da manhã',
      sugestao: 'Vitamina de banana com aveia e pasta de amendoim',
    },
    {
      refeicao: 'Almoço',
      sugestao:
        'Patinho ou coxão mole grelhado + arroz + feijão + batata-doce + salada',
    },
    {
      refeicao: 'Pré-treino',
      sugestao: 'Arroz integral + frango grelhado',
    },
    {
      refeicao: 'Pós-treino',
      sugestao: 'Whey protein + banana (carboidrato de rápida absorção)',
    },
    {
      refeicao: 'Jantar',
      sugestao: 'Filé de frango + macarrão integral + legumes refogados',
    },
  ],
  [ObjetivoTreino.ABDOMEN_DEFINIDO]: [
    {
      refeicao: 'Café da manhã',
      sugestao: 'Omelete de claras + 1 fatia de pão integral + café sem açúcar',
    },
    {
      refeicao: 'Lanche da manhã',
      sugestao: 'Iogurte desnatado + 1 fruta',
    },
    {
      refeicao: 'Almoço',
      sugestao:
        'Peito de frango grelhado + salada à vontade + porção pequena de arroz integral',
    },
    {
      refeicao: 'Pré-treino',
      sugestao: 'Fruta (maçã ou banana) + café',
    },
    {
      refeicao: 'Pós-treino',
      sugestao: 'Whey protein isolado',
    },
    {
      refeicao: 'Jantar',
      sugestao: 'Tilápia ou peixe branco grelhado + legumes no vapor + salada verde',
    },
  ],
};

/**
 * Ajustes adicionais conforme a faixa de IMC. Somados (sem duplicar) à base do
 * objetivo. Faixa "NORMAL" não adiciona itens.
 */
export const AJUSTE_POR_FAIXA: Partial<
  Record<FaixaImc, Partial<BaseObjetivo>>
> = {
  ABAIXO: {
    alimentacao: [
      'IMC abaixo do peso: priorizar superávit calórico para ganho de massa',
      'Refeições mais frequentes e calóricas (5-6 ao dia)',
    ],
    suplementos: ['Hipercalórico (mass gainer) como apoio calórico (opcional)'],
  },
  SOBREPESO: {
    exercicios: ['Acrescentar 20-30 min de cardio na maioria dos treinos'],
    alimentacao: [
      'IMC em sobrepeso: manter déficit calórico moderado',
      'Controlar porções de carboidrato simples',
    ],
  },
  OBESIDADE: {
    exercicios: [
      'Priorizar cardio de baixo impacto e progressão gradual de carga',
      'Acompanhamento próximo do instrutor para evitar sobrecarga articular',
    ],
    alimentacao: [
      'IMC em obesidade: déficit calórico orientado por nutricionista',
      'Foco em alimentos in natura e controle de ultraprocessados',
    ],
  },
};
