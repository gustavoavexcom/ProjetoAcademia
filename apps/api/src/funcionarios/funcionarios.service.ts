import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreateFuncionarioDto } from './dto/create-funcionario.dto';
import { UpdateFuncionarioDto } from './dto/update-funcionario.dto';

@Injectable()
export class FuncionariosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateFuncionarioDto) {
    try {
      return await this.prisma.funcionario.create({ data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'funcionário');
    }
  }

  findAll() {
    return this.prisma.funcionario.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: string) {
    const funcionario = await this.prisma.funcionario.findUnique({ where: { id } });
    if (!funcionario) {
      throw new NotFoundException(`Funcionário ${id} não encontrado`);
    }
    return funcionario;
  }

  async update(id: string, dto: UpdateFuncionarioDto) {
    await this.findOne(id);
    try {
      return await this.prisma.funcionario.update({ where: { id }, data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'funcionário');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.funcionario.delete({ where: { id } });
    } catch (error) {
      throw traduzErroPrisma(error, 'funcionário');
    }
    return { id, removido: true };
  }
}
