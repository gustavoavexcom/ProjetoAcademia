import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';

@Injectable()
export class AlunosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAlunoDto) {
    try {
      return await this.prisma.aluno.create({ data: dto });
    } catch (error) {
      throw this.traduzErro(error);
    }
  }

  findAll() {
    return this.prisma.aluno.findMany({ orderBy: { criadoEm: 'desc' } });
  }

  async findOne(id: string) {
    const aluno = await this.prisma.aluno.findUnique({ where: { id } });
    if (!aluno) {
      throw new NotFoundException(`Aluno ${id} não encontrado`);
    }
    return aluno;
  }

  async update(id: string, dto: UpdateAlunoDto) {
    await this.findOne(id);
    try {
      return await this.prisma.aluno.update({ where: { id }, data: dto });
    } catch (error) {
      throw this.traduzErro(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.aluno.delete({ where: { id } });
    return { id, removido: true };
  }

  /** Converte erros conhecidos do Prisma em exceções HTTP apropriadas. */
  private traduzErro(error: unknown): Error {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      const alvo = (error.meta?.target as string[] | undefined)?.join(', ') ?? 'campo único';
      return new ConflictException(`Já existe um aluno com este ${alvo}`);
    }
    return error instanceof Error ? error : new Error(String(error));
  }
}
