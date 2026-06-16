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

export class CreateAlunoDto {
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome!: string;

  @IsEmail({}, { message: 'email inválido' })
  email!: string;

  @IsString()
  @Matches(/^\d{11}$/, { message: 'cpf deve conter 11 dígitos (somente números)' })
  cpf!: string;

  @IsOptional()
  @IsString()
  @Length(8, 20, { message: 'telefone deve ter entre 8 e 20 caracteres' })
  telefone?: string;

  @IsOptional()
  @IsEnum(StatusAluno, { message: 'status inválido' })
  status?: StatusAluno;
}
