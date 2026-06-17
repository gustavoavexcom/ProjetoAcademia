import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePlanoDto {
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome!: string;

  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'valorMensal deve ser numérico' })
  @Min(0, { message: 'valorMensal não pode ser negativo' })
  valorMensal!: number;

  @IsOptional()
  @IsString()
  descricao?: string;

  @IsOptional()
  @IsBoolean()
  ativo?: boolean;
}
