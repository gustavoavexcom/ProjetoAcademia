import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

@Injectable()
export class AvaliacoesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAvaliacaoDto) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { id: dto.alunoId },
    });
    if (!aluno) {
      throw new NotFoundException(`Aluno ${dto.alunoId} não encontrado`);
    }
    const { data, ...resto } = dto;
    try {
      return await this.prisma.avaliacaoFisica.create({
        data: { ...resto, data: data ? new Date(data) : undefined },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'avaliação física');
    }
  }

  findAll(alunoId?: string) {
    return this.prisma.avaliacaoFisica.findMany({
      where: alunoId ? { alunoId } : undefined,
      orderBy: { data: 'desc' },
      include: { aluno: true },
    });
  }

  async findOne(id: string) {
    const avaliacao = await this.prisma.avaliacaoFisica.findUnique({
      where: { id },
      include: { aluno: true },
    });
    if (!avaliacao) {
      throw new NotFoundException(`Avaliação ${id} não encontrada`);
    }
    return avaliacao;
  }

  async update(id: string, dto: UpdateAvaliacaoDto) {
    await this.findOne(id);
    const { data, ...resto } = dto;
    try {
      return await this.prisma.avaliacaoFisica.update({
        where: { id },
        data: { ...resto, data: data ? new Date(data) : undefined },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'avaliação física');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.avaliacaoFisica.delete({ where: { id } });
    } catch (error) {
      throw traduzErroPrisma(error, 'avaliação física');
    }
    return { id, removido: true };
  }
}
