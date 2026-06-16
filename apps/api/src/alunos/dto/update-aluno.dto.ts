import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { StatusAluno } from '@academia/shared';

/** Atualização parcial de aluno — todos os campos são opcionais. */
export class UpdateAlunoDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome?: string;

  @IsOptional()
  @IsEmail({}, { message: 'email inválido' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{11}$/, { message: 'cpf deve conter 11 dígitos (somente números)' })
  cpf?: string;

  @IsOptional()
  @IsString()
  @Length(8, 20, { message: 'telefone deve ter entre 8 e 20 caracteres' })
  telefone?: string;

  @IsOptional()
  @IsEnum(StatusAluno, { message: 'status inválido' })
  status?: StatusAluno;
}
