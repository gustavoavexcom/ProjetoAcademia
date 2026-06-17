import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MinLength,
} from 'class-validator';
import { StatusAluno } from '@academia/shared';

export class CreateAlunoDto {
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome!: string;

  @IsOptional()
  @IsEmail({}, { message: 'email inválido' })
  email?: string;

  @IsString()
  @Matches(/^\d{11,14}$/, {
    message: 'cpf/cnpj deve conter de 11 a 14 dígitos (somente números)',
  })
  cpf!: string;

  @IsOptional()
  @IsString()
  @Length(8, 20, { message: 'telefone deve ter entre 8 e 20 caracteres' })
  telefone?: string;

  @IsOptional()
  @IsEnum(StatusAluno, { message: 'status inválido' })
  status?: StatusAluno;

  @IsOptional()
  @IsDateString({}, { message: 'dataMatricula deve ser uma data válida (ISO)' })
  dataMatricula?: string;

  @IsOptional()
  @IsUUID('all', { message: 'planoId inválido' })
  planoId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^data:image\/(png|jpe?g|webp);base64,/, {
    message: 'fotoBase64 deve ser uma data URL de imagem (base64)',
  })
  fotoBase64?: string;
}
