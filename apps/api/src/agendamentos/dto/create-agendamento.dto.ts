import { IsDateString, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAgendamentoDto {
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome!: string;

  @IsDateString({}, { message: 'data deve estar em formato de data ISO' })
  data!: string;

  @IsString()
  @MinLength(2, { message: 'atendente deve ter ao menos 2 caracteres' })
  atendente!: string;

  @IsOptional()
  @IsString()
  observacao?: string;
}
