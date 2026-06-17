import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

/** Atualização parcial de plano — todos os campos são opcionais. */
export class UpdatePlanoDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'valorMensal deve ser numérico' })
  @Min(0, { message: 'valorMensal não pode ser negativo' })
  valorMensal?: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
