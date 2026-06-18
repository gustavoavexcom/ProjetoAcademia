import type { ResultadoImc } from '@academia/shared';

/** Faixa de IMC usada para ajustar a recomendação (alinhada à classificação OMS). */
export type FaixaImc = 'ABAIXO' | 'NORMAL' | 'SOBREPESO' | 'OBESIDADE';

/**
 * Calcula o IMC (Índice de Massa Corporal) a partir de peso (kg) e altura (cm).
 * Retorna `null` quando faltar peso ou altura, ou quando os valores forem inválidos.
 * Fórmula: IMC = peso / (altura_em_metros)^2.
 */
export function calcularImc(
  pesoKg?: number | null,
  alturaCm?: number | null,
): ResultadoImc | null {
  if (pesoKg == null || alturaCm == null) return null;
  if (pesoKg <= 0 || alturaCm <= 0) return null;

  const alturaM = alturaCm / 100;
  const valor = Math.round((pesoKg / (alturaM * alturaM)) * 10) / 10;

  return { valor, classificacao: classificacaoImc(valor) };
}

/** Classificação textual do IMC segundo as faixas da OMS. */
export function classificacaoImc(imc: number): string {
  if (imc < 18.5) return 'Abaixo do peso';
  if (imc < 25) return 'Peso normal';
  if (imc < 30) return 'Sobrepeso';
  return 'Obesidade';
}

/** Faixa de IMC (enum interno) usada para escolher os ajustes da base curada. */
export function faixaImc(imc: number): FaixaImc {
  if (imc < 18.5) return 'ABAIXO';
  if (imc < 25) return 'NORMAL';
  if (imc < 30) return 'SOBREPESO';
  return 'OBESIDADE';
}
