import { Injectable, NotFoundException } from '@nestjs/common';
import { TipoAcesso } from '@academia/shared';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreateAcessoDto } from './dto/create-acesso.dto';
import { CheckinDto } from './dto/checkin.dto';

@Injectable()
export class AcessosService {
  constructor(private readonly prisma: PrismaService) {}

  /** Registra a passagem do aluno na catraca. */
  async registrar(dto: CreateAcessoDto) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { id: dto.alunoId },
    });
    if (!aluno) {
      throw new NotFoundException(`Aluno ${dto.alunoId} não encontrado`);
    }
    try {
      return await this.prisma.acesso.create({
        data: { alunoId: dto.alunoId, tipo: dto.tipo },
        include: { aluno: true },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'acesso');
    }
  }

  /**
   * Confirma a passagem do aluno na catraca a partir da leitura do QR code.
   * Resolve o aluno pelo token contido no QR e registra o acesso (entrada por padrão).
   */
  async checkinPorQr(dto: CheckinDto) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { qrCode: dto.qrCode },
    });
    if (!aluno) {
      throw new NotFoundException('QR code não reconhecido');
    }
    const tipo = dto.tipo ?? TipoAcesso.ENTRADA;
    try {
      const acesso = await this.prisma.acesso.create({
        data: { alunoId: aluno.id, tipo },
      });
      return {
        acesso,
        aluno: {
          id: aluno.id,
          nome: aluno.nome,
          fotoBase64: aluno.fotoBase64 ?? undefined,
          status: aluno.status,
        },
      };
    } catch (error) {
      throw traduzErroPrisma(error, 'acesso');
    }
  }

  findAll(alunoId?: string) {
    return this.prisma.acesso.findMany({
      where: alunoId ? { alunoId } : undefined,
      orderBy: { registro: 'desc' },
      include: { aluno: true },
    });
  }

  async remove(id: string) {
    const acesso = await this.prisma.acesso.findUnique({ where: { id } });
    if (!acesso) {
      throw new NotFoundException(`Acesso ${id} não encontrado`);
    }
    await this.prisma.acesso.delete({ where: { id } });
    return { id, removido: true };
  }
}
