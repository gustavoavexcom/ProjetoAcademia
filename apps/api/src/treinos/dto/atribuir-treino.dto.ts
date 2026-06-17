import { IsUUID } from 'class-validator';

/** Atribui (ou reatribui) um treino a um aluno. */
export class AtribuirTreinoDto {
  @IsUUID('all', { message: 'alunoId inválido' })
  alunoId!: string;
}
