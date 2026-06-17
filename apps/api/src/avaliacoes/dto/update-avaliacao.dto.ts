import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

/** Atualização parcial de avaliação física (o aluno não muda). */
export class UpdateAvaliacaoDto {
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
  @IsString()
  observacoes?: string;
}
