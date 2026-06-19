import { IsOptional, IsString, MinLength } from 'class-validator';

/** Atualização parcial de exercício — todos os campos são opcionais. */
export class UpdateExercicioDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'grupoMuscular deve ter ao menos 2 caracteres' })
  grupoMuscular?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'aparelho deve ter ao menos 2 caracteres' })
  aparelho?: string;
}
