import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

@Injectable()
export class AgendamentosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAgendamentoDto) {
    try {
      return await this.prisma.agendamento.create({
        data: { ...dto, data: new Date(dto.data) },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'agendamento');
    }
  }

  findAll() {
    return this.prisma.agendamento.findMany({ orderBy: { data: 'asc' } });
  }

  async findOne(id: string) {
    const agendamento = await this.prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) {
      throw new NotFoundException(`Agendamento ${id} não encontrado`);
    }
    return agendamento;
  }

  async update(id: string, dto: UpdateAgendamentoDto) {
    await this.findOne(id);
    try {
      return await this.prisma.agendamento.update({
        where: { id },
        data: { ...dto, ...(dto.data ? { data: new Date(dto.data) } : {}) },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'agendamento');
    }
  }

  async remove(id: string) {
    await this.findOne(id);
    try {
      await this.prisma.agendamento.delete({ where: { id } });
    } catch (error) {
      throw traduzErroPrisma(error, 'agendamento');
    }
    return { id, removido: true };
  }
}
