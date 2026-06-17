import {
  IsInt,
  IsOptional,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

/** Gera uma mensalidade a partir do plano vinculado ao aluno. */
export class GerarMensalidadeDto {
  @IsUUID('all', { message: 'alunoId inválido' })
  alunoId!: string;

  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'competencia deve estar no formato AAAA-MM',
  })
  competencia!: string;

  @IsOptional()
  @IsInt({ message: 'diaVencimento deve ser inteiro' })
  @Min(1)
  @Max(28)
  diaVencimento?: number;
}
