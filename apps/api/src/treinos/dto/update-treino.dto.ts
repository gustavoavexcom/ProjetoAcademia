import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ExercicioTreinoDto } from './create-treino.dto';

/** Atualização parcial de treino. Se `exercicios` vier, substitui a lista atual. */
export class UpdateTreinoDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome?: string;

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
