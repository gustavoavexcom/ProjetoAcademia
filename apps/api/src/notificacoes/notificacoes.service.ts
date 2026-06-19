import { Injectable, NotFoundException } from '@nestjs/common';
import { StatusMensalidade } from '@prisma/client';
import type { AvisoPainel } from '@academia/shared';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';

/** Janela (em dias) em que um vencimento futuro já vira aviso verde "a vencer". */
const JANELA_PLANO_DIAS = 30;
const JANELA_MENSALIDADE_DIAS = 7;

const DIA_MS = 24 * 60 * 60 * 1000;

/** Meia-noite de hoje (referência para comparar vencimentos sem considerar a hora). */
function inicioDeHoje(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}

/** Diferença em dias inteiros entre uma data futura e hoje (negativo se já passou). */
function diasAte(data: Date, hoje: Date): number {
  return Math.floor((data.getTime() - hoje.getTime()) / DIA_MS);
}

@Injectable()
export class NotificacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificacaoDto) {
    try {
      return await this.prisma.notificacao.create({ data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'notificação');
    }
  }

  findAll() {
    return this.prisma.notificacao.findMany({ orderBy: { criadoEm: 'desc' } });
  }

  async findOne(id: string) {
    const notificacao = await this.prisma.notificacao.findUnique({ where: { id } });
    if (!notificacao) {
      throw new NotFoundException(`Notificação ${id} não encontrada`);
    }
    return notificacao;
  }

  async update(id: string, dto: UpdateNotificacaoDto) {
    await this.findOne(id);
    try {
      return await this.prisma.notificacao.update({ where: { id }, data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'notificação');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.notificacao.delete({ where: { id } });
    } catch (error) {
      throw traduzErroPrisma(error, 'notificação');
    }
    return { id, removido: true };
  }

  /**
   * Painel da tela principal: notificações divulgadas + avisos de vencimento.
   * Avisos seguem o código de cores: verde = a vencer (dentro da janela);
   * vermelho = já vencido (plano sem renovação / mensalidade em atraso).
   */
  async painel() {
    const hoje = inicioDeHoje();
    const notificacoes = await this.findAll();
    const avisos: AvisoPainel[] = [];

    // --- Avisos de plano (ex.: plano anual próximo do vencimento) ---
    const alunosComPlano = await this.prisma.aluno.findMany({
      where: { vencimentoPlano: { not: null }, status: 'ATIVO' },
      orderBy: { vencimentoPlano: 'asc' },
    });
    for (const aluno of alunosComPlano) {
      const vencimento = aluno.vencimentoPlano!;
      const dias = diasAte(vencimento, hoje);
      if (dias < 0) {
        avisos.push({
          id: `plano-${aluno.id}`,
          categoria: 'PLANO',
          aluno: aluno.nome,
          descricao: `Plano venceu há ${Math.abs(dias)} dia(s) e não foi renovado`,
          cor: 'vermelho',
          data: vencimento.toISOString(),
        });
      } else if (dias <= JANELA_PLANO_DIAS) {
        avisos.push({
          id: `plano-${aluno.id}`,
          categoria: 'PLANO',
          aluno: aluno.nome,
          descricao:
            dias === 0
              ? 'Plano vence hoje — renovação pendente'
              : `Plano vence em ${dias} dia(s)`,
          cor: 'verde',
          data: vencimento.toISOString(),
        });
      }
    }

    // --- Avisos de mensalidade (pagamento mensal a vencer / em atraso) ---
    const limiteFuturo = new Date(hoje.getTime() + JANELA_MENSALIDADE_DIAS * DIA_MS);
    const mensalidades = await this.prisma.mensalidade.findMany({
      where: {
        status: { in: [StatusMensalidade.PENDENTE, StatusMensalidade.VENCIDA] },
        vencimento: { lt: limiteFuturo },
      },
      orderBy: { vencimento: 'asc' },
      include: { aluno: true },
    });
    for (const m of mensalidades) {
      const dias = diasAte(m.vencimento, hoje);
      if (dias < 0) {
        avisos.push({
          id: `mensalidade-${m.id}`,
          categoria: 'MENSALIDADE',
          aluno: m.aluno.nome,
          descricao: `Mensalidade ${m.competencia} vencida há ${Math.abs(dias)} dia(s)`,
          cor: 'vermelho',
          data: m.vencimento.toISOString(),
        });
      } else {
        avisos.push({
          id: `mensalidade-${m.id}`,
          categoria: 'MENSALIDADE',
          aluno: m.aluno.nome,
          descricao:
            dias === 0
              ? `Mensalidade ${m.competencia} vence hoje`
              : `Mensalidade ${m.competencia} vence em ${dias} dia(s)`,
          cor: 'verde',
          data: m.vencimento.toISOString(),
        });
      }
    }

    return { notificacoes, avisos };
  }
}
