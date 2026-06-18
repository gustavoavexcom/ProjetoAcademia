import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ObjetivoTreino } from '@academia/shared';

export class CreateAvaliacaoDto {
  @IsUUID('all', { message: 'alunoId inválido' })
  alunoId!: string;

  @IsOptional()
  @IsDateString({}, { message: 'data deve ser uma data válida (ISO)' })
  data?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pesoKg?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  alturaCm?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  percentualGordura?: number;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  massaMuscularKg?: number;

  @IsOptional()
  @IsEnum(ObjetivoTreino, { message: 'objetivo inválido' })
  objetivo?: ObjetivoTreino;

  @IsOptional()
  @IsString()
  observacoes?: string;
}
