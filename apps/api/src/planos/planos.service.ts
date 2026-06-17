import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreatePlanoDto } from './dto/create-plano.dto';
import { UpdatePlanoDto } from './dto/update-plano.dto';

@Injectable()
export class PlanosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePlanoDto) {
    try {
      return await this.prisma.plano.create({ data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'plano');
    }
  }

  findAll() {
    return this.prisma.plano.findMany({ orderBy: { nome: 'asc' } });
  }

  async findOne(id: string) {
    const plano = await this.prisma.plano.findUnique({ where: { id } });
    if (!plano) {
      throw new NotFoundException(`Plano ${id} não encontrado`);
    }
    return plano;
  }

  async update(id: string, dto: UpdatePlanoDto) {
    await this.findOne(id);
    try {
      return await this.prisma.plano.update({ where: { id }, data: dto });
    } catch (error) {
      throw traduzErroPrisma(error, 'plano');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.plano.delete({ where: { id } });
    } catch (error) {
      throw traduzErroPrisma(error, 'plano');
    }
    return { id, removido: true };
  }
}
