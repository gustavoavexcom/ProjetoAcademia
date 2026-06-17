import { ConflictException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

/**
 * Converte erros conhecidos do Prisma em exceções HTTP apropriadas.
 * Reutilizado por todos os services do domínio.
 *
 * @param entidade nome amigável da entidade (ex.: "aluno", "plano") para a mensagem.
 */
export function traduzErroPrisma(error: unknown, entidade = 'registro'): Error {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const alvo =
        (error.meta?.target as string[] | undefined)?.join(', ') ?? 'campo único';
      return new ConflictException(`Já existe um ${entidade} com este ${alvo}`);
    }
    if (error.code === 'P2025') {
      return new NotFoundException(`${entidade} não encontrado`);
    }
    if (error.code === 'P2003') {
      return new ConflictException(
        `Operação inválida: ${entidade} possui vínculos com outros registros`,
      );
    }
  }
  return error instanceof Error ? error : new Error(String(error));
}
