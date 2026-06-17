import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ExercicioTreinoDto {
  @IsString()
  @MinLength(2, { message: 'nome do exercício deve ter ao menos 2 caracteres' })
  nome!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  series?: number;

  @IsOptional()
  @IsString()
  repeticoes?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cargaKg?: number;
}

export class CreateTreinoDto {
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome!: string;

  @IsOptional()
  @IsString()
  objetivo?: string;

  @IsOptional()
  @IsString()
  instrutor?: string;

  @IsOptional()
  @IsUUID('all', { message: 'alunoId inválido' })
  alunoId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExercicioTreinoDto)
  exercicios?: ExercicioTreinoDto[];
}
