import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ObjetivoTreino } from '@academia/shared';

export class GerarRecomendacaoDto {
  @IsEnum(ObjetivoTreino, { message: 'objetivo inválido' })
  objetivo!: ObjetivoTreino;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pesoKg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  alturaCm?: number;
}
