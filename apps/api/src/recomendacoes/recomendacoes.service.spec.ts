import { ObjetivoTreino } from '@academia/shared';
import { calcularImc, classificacaoImc, faixaImc } from './imc.util';
import { RecomendacoesService } from './recomendacoes.service';

describe('calcularImc', () => {
  it('calcula o IMC e classifica como peso normal', () => {
    // 70 kg, 175 cm → 22.9
    const r = calcularImc(70, 175);
    expect(r).not.toBeNull();
    expect(r?.valor).toBe(22.9);
    expect(r?.classificacao).toBe('Peso normal');
  });

  it('retorna null quando faltar peso ou altura', () => {
    expect(calcularImc(undefined, 175)).toBeNull();
    expect(calcularImc(70, undefined)).toBeNull();
    expect(calcularImc(0, 175)).toBeNull();
  });

  it('classifica as faixas da OMS corretamente', () => {
    expect(classificacaoImc(17)).toBe('Abaixo do peso');
    expect(classificacaoImc(22)).toBe('Peso normal');
    expect(classificacaoImc(27)).toBe('Sobrepeso');
    expect(classificacaoImc(33)).toBe('Obesidade');
    expect(faixaImc(33)).toBe('OBESIDADE');
  });
});

describe('RecomendacoesService', () => {
  const service = new RecomendacoesService();

  it('lista os três objetivos com rótulos', () => {
    const objetivos = service.listarObjetivos();
    expect(objetivos).toHaveLength(3);
    expect(objetivos.map((o) => o.valor)).toContain(ObjetivoTreino.ABDOMEN_DEFINIDO);
    expect(objetivos[0].rotulo).toBeTruthy();
  });

  it('gera recomendação com IMC e listas preenchidas', () => {
    const r = service.gerar({
      objetivo: ObjetivoTreino.FORCA_SUPERIOR,
      pesoKg: 70,
      alturaCm: 175,
    });
    expect(r.imc?.valor).toBe(22.9);
    expect(r.exercicios.length).toBeGreaterThan(0);
    expect(r.alimentacao.length).toBeGreaterThan(0);
    expect(r.suplementos.length).toBeGreaterThan(0);
  });

  it('aplica o ajuste da faixa de sobrepeso (adiciona cardio)', () => {
    // 95 kg, 175 cm → IMC ~31 (obesidade) → ajuste de cardio/baixo impacto
    const r = service.gerar({
      objetivo: ObjetivoTreino.FORCA_SUPERIOR,
      pesoKg: 95,
      alturaCm: 175,
    });
    const semAjuste = service.gerar({ objetivo: ObjetivoTreino.FORCA_SUPERIOR });
    expect(r.exercicios.length).toBeGreaterThan(semAjuste.exercicios.length);
  });

  it('gera recomendação sem IMC quando não há peso/altura', () => {
    const r = service.gerar({ objetivo: ObjetivoTreino.ABDOMEN_DEFINIDO });
    expect(r.imc).toBeNull();
    expect(r.exercicios.length).toBeGreaterThan(0);
  });

  it('inclui cardápio concreto por refeição para o objetivo', () => {
    const r = service.gerar({ objetivo: ObjetivoTreino.FORCA_SUPERIOR });
    expect(r.cardapio.length).toBeGreaterThan(0);
    expect(r.cardapio.every((c) => c.refeicao && c.sugestao)).toBe(true);
    // O cardápio de membros superiores prioriza pratos ricos em proteína.
    const almoco = r.cardapio.find((c) => c.refeicao === 'Almoço');
    expect(almoco?.sugestao).toMatch(/salmão/i);
  });
});
