import { Injectable } from '@nestjs/common';
import {
  OBJETIVO_TREINO_ROTULOS,
  ObjetivoTreino,
  type Recomendacao,
} from '@academia/shared';
import { calcularImc, faixaImc } from './imc.util';
import { AJUSTE_POR_FAIXA, BASE_POR_OBJETIVO } from './recomendacoes.data';
import { GerarRecomendacaoDto } from './dto/gerar-recomendacao.dto';

@Injectable()
export class RecomendacoesService {
  /** Lista de objetivos disponíveis (valor + rótulo amigável) para selects da UI. */
  listarObjetivos(): { valor: ObjetivoTreino; rotulo: string }[] {
    return Object.values(ObjetivoTreino).map((valor) => ({
      valor,
      rotulo: OBJETIVO_TREINO_ROTULOS[valor],
    }));
  }

  /**
   * Monta a recomendação para um objetivo, calculando o IMC (quando peso/altura
   * forem informados) e somando os ajustes da faixa de IMC à base curada.
   */
  gerar(dto: GerarRecomendacaoDto): Recomendacao {
    const base = BASE_POR_OBJETIVO[dto.objetivo];
    const imc = calcularImc(dto.pesoKg, dto.alturaCm);

    const ajuste = imc ? AJUSTE_POR_FAIXA[faixaImc(imc.valor)] : undefined;

    return {
      imc,
      objetivo: dto.objetivo,
      exercicios: mesclar(base.exercicios, ajuste?.exercicios),
      alimentacao: mesclar(base.alimentacao, ajuste?.alimentacao),
      suplementos: mesclar(base.suplementos, ajuste?.suplementos),
    };
  }
}

/** Concatena base + ajuste removendo duplicatas, preservando a ordem. */
function mesclar(base: string[], ajuste?: string[]): string[] {
  return Array.from(new Set([...base, ...(ajuste ?? [])]));
}
