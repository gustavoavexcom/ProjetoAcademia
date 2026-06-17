import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StatusMensalidade } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { GerarMensalidadeDto } from './dto/gerar-mensalidade.dto';

@Injectable()
export class MensalidadesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Gera a mensalidade do aluno usando o plano vinculado a ele. */
  async gerar(dto: GerarMensalidadeDto) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { id: dto.alunoId },
      include: { plano: true },
    });
    if (!aluno) {
      throw new NotFoundException(`Aluno ${dto.alunoId} não encontrado`);
    }
    if (!aluno.planoId || !aluno.plano) {
      throw new BadRequestException('Aluno não possui plano vinculado');
    }

    const [ano, mes] = dto.competencia.split('-').map(Number);
    const dia = dto.diaVencimento ?? 10;
    const vencimento = new Date(Date.UTC(ano, mes - 1, dia));

    try {
      return await this.prisma.mensalidade.create({
        data: {
          alunoId: aluno.id,
          planoId: aluno.planoId,
          competencia: dto.competencia,
          valor: aluno.plano.valorMensal,
          vencimento,
          status: StatusMensalidade.PENDENTE,
        },
        include: { aluno: true, plano: true },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'mensalidade');
    }
  }

  findAll() {
    return this.prisma.mensalidade.findMany({
      orderBy: [{ competencia: 'desc' }, { vencimento: 'asc' }],
      include: { aluno: true, plano: true },
    });
  }

  /** Inadimplentes: pendentes/vencidas com vencimento já no passado. */
  inadimplentes() {
    return this.prisma.mensalidade.findMany({
      where: {
        status: { in: [StatusMensalidade.PENDENTE, StatusMensalidade.VENCIDA] },
        vencimento: { lt: new Date() },
      },
      orderBy: { vencimento: 'asc' },
      include: { aluno: true, plano: true },
    });
  }

  async findOne(id: string) {
    const mensalidade = await this.prisma.mensalidade.findUnique({
      where: { id },
      include: { aluno: true, plano: true },
    });
    if (!mensalidade) {
      throw new NotFoundException(`Mensalidade ${id} não encontrada`);
    }
    return mensalidade;
  }

  /** Registra o pagamento de uma mensalidade. */
  async pagar(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.mensalidade.update({
        where: { id },
        data: { status: StatusMensalidade.PAGA, pagoEm: new Date() },
        include: { aluno: true, plano: true },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'mensalidade');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.mensalidade.delete({ where: { id } });
    } catch (error) {
      throw traduzErroPrisma(error, 'mensalidade');
    }
    return { id, removido: true };
  }
}
