import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreateTreinoDto } from './dto/create-treino.dto';
import { UpdateTreinoDto } from './dto/update-treino.dto';
import { AtribuirTreinoDto } from './dto/atribuir-treino.dto';

@Injectable()
export class TreinosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTreinoDto) {
    const { exercicios, ...dadosTreino } = dto;
    try {
      return await this.prisma.treino.create({
        data: {
          ...dadosTreino,
          exercicios: exercicios?.length
            ? { create: exercicios }
            : undefined,
        },
        include: { exercicios: true, aluno: true },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'treino');
    }
  }

  findAll() {
    return this.prisma.treino.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { exercicios: true, aluno: true },
    });
  }

  async findOne(id: string) {
    const treino = await this.prisma.treino.findUnique({
      where: { id },
      include: { exercicios: true, aluno: true },
    });
    if (!treino) {
      throw new NotFoundException(`Treino ${id} não encontrado`);
    }
    return treino;
  }

  async update(id: string, dto: UpdateTreinoDto) {
    await this.findOne(id);
    const { exercicios, ...dadosTreino } = dto;
    try {
      // Quando a lista de exercícios é enviada, ela substitui a anterior.
      if (exercicios) {
        await this.prisma.exercicioTreino.deleteMany({ where: { treinoId: id } });
      }
      return await this.prisma.treino.update({
        where: { id },
        data: {
          ...dadosTreino,
          exercicios: exercicios ? { create: exercicios } : undefined,
        },
        include: { exercicios: true, aluno: true },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'treino');
    }
  }

  async atribuir(id: string, dto: AtribuirTreinoDto) {
    await this.findOne(id);
    const aluno = await this.prisma.aluno.findUnique({
      where: { id: dto.alunoId },
    });
    if (!aluno) {
      throw new NotFoundException(`Aluno ${dto.alunoId} não encontrado`);
    }
    return this.prisma.treino.update({
      where: { id },
      data: { alunoId: dto.alunoId },
      include: { exercicios: true, aluno: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.treino.delete({ where: { id } });
    } catch (error) {
      throw traduzErroPrisma(error, 'treino');
    }
    return { id, removido: true };
  }
}
