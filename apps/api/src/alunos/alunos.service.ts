import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';

@Injectable()
export class AlunosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAlunoDto) {
    try {
      return await this.prisma.aluno.create({ data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'aluno');
    }
  }

  findAll() {
    return this.prisma.aluno.findMany({
      orderBy: { criadoEm: 'desc' },
      include: { plano: true },
    });
  }

  async findOne(id: string) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { id },
      include: { plano: true },
    });
    if (!aluno) {
      throw new NotFoundException(`Aluno ${id} não encontrado`);
    }
    return aluno;
  }

  /**
   * Busca um aluno pelo CPF (somente dígitos são considerados). Usado no fluxo
   * de avaliação física, em que o instrutor digita o CPF para localizar o aluno.
   */
  async findByCpf(cpf: string) {
    const cpfLimpo = (cpf ?? '').replace(/\D/g, '');
    const aluno = await this.prisma.aluno.findUnique({
      where: { cpf: cpfLimpo },
      include: { plano: true },
    });
    if (!aluno) {
      throw new NotFoundException(`Aluno com CPF ${cpfLimpo} não encontrado`);
    }
    return aluno;
  }

  async update(id: string, dto: UpdateAlunoDto) {
    await this.findOne(id);
    try {
      return await this.prisma.aluno.update({ where: { id }, data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'aluno');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.aluno.delete({ where: { id } });
    } catch (error) {
      throw traduzErroPrisma(error, 'aluno');
    }
    return { id, removido: true };
  }
}
