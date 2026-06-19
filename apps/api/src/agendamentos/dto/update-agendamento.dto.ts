import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

/** Atualização parcial de agendamento — todos os campos são opcionais. */
export class UpdateAgendamentoDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome?: string;

  @IsOptional()
  @IsDateString({}, { message: 'data deve estar em formato de data ISO' })
  data?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'atendente deve ter ao menos 2 caracteres' })
  atendente?: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
