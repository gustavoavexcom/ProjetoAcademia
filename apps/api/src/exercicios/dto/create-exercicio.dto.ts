import { IsString, MinLength } from 'class-validator';

export class CreateExercicioDto {
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome!: string;

  @IsString()
  @MinLength(2, { message: 'grupoMuscular deve ter ao menos 2 caracteres' })
  grupoMuscular!: string;

  @IsString()
  @MinLength(2, { message: 'aparelho deve ter ao menos 2 caracteres' })
  aparelho!: string;
}
