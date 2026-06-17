import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreateAcessoDto } from './dto/create-acesso.dto';

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
