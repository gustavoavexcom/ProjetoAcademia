import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StatusNota } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { traduzErroPrisma } from '../common/prisma-error';
import { EmitirNotaDto } from './dto/emitir-nota.dto';

@Injectable()
export class NotasService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Emissão SIMULADA de NFS-e. Gera número e protocolo fictícios e persiste a nota.
   * Não há integração com a prefeitura (fora do escopo).
   */
  async emitir(dto: EmitirNotaDto) {
    const aluno = await this.prisma.aluno.findUnique({
      where: { id: dto.alunoId },
    });
    if (!aluno) {
      throw new NotFoundException(`Aluno ${dto.alunoId} não encontrado`);
    }

    let valor = dto.valor;
    if (dto.mensalidadeId) {
      const mensalidade = await this.prisma.mensalidade.findUnique({
        where: { id: dto.mensalidadeId },
      });
      if (!mensalidade) {
        throw new NotFoundException(
          `Mensalidade ${dto.mensalidadeId} não encontrada`,
        );
      }
      valor = valor ?? Number(mensalidade.valor);
    }
    if (valor === undefined) {
      throw new BadRequestException(
        'Informe o valor da nota ou uma mensalidade para herdar o valor',
      );
    }

    const ano = new Date().getFullYear();
    const total = await this.prisma.notaFiscal.count();
    const numero = `NFSE-${ano}-${String(total + 1).padStart(6, '0')}`;
    const protocolo = `${Date.now()}${Math.floor(Math.random() * 1000)}`;

    try {
      return await this.prisma.notaFiscal.create({
        data: {
          alunoId: dto.alunoId,
          mensalidadeId: dto.mensalidadeId ?? null,
          numero,
          protocolo,
          valor: new Prisma.Decimal(valor),
          descricaoServico:
            dto.descricaoServico ?? 'Mensalidade de serviços de academia',
          status: StatusNota.EMITIDA,
        },
        include: { aluno: true },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'nota fiscal');
    }
  }

  findAll() {
    return this.prisma.notaFiscal.findMany({
      orderBy: { emitidaEm: 'desc' },
      include: { aluno: true },
    });
  }

  async findOne(id: string) {
    const nota = await this.prisma.notaFiscal.findUnique({
      where: { id },
      include: { aluno: true },
    });
    if (!nota) {
      throw new NotFoundException(`Nota fiscal ${id} não encontrada`);
    }
    return nota;
  }

  async cancelar(id: string) {
    await this.findOne(id);
    try {
      return await this.prisma.notaFiscal.update({
        where: { id },
        data: { status: StatusNota.CANCELADA },
        include: { aluno: true },
      });
    } catch (error) {
      throw traduzErroPrisma(error, 'nota fiscal');
    }
  }
}
