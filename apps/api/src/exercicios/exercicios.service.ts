import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreateExercicioDto } from './dto/create-exercicio.dto';
import { UpdateExercicioDto } from './dto/update-exercicio.dto';

@Injectable()
export class ExerciciosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExercicioDto) {
    try {
      return await this.prisma.exercicio.create({ data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'exercício');
    }
  }

  findAll() {
    return this.prisma.exercicio.findMany({
      orderBy: [{ grupoMuscular: 'asc' }, { nome: 'asc' }],
    });
  }

  async findOne(id: string) {
    const exercicio = await this.prisma.exercicio.findUnique({ where: { id } });
    if (!exercicio) {
      throw new NotFoundException(`Exercício ${id} não encontrado`);
    }
    return exercicio;
  }

  async update(id: string, dto: UpdateExercicioDto) {
    await this.findOne(id);
    try {
      return await this.prisma.exercicio.update({ where: { id }, data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'exercício');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.exercicio.delete({ where: { id } });
    } catch (error) {
      throw traduzErroPrisma(error, 'exercício');
    }
    return { id, removido: true };
  }
}
