import { IsOptional, IsString, Matches, MinLength } from 'class-validator';

/** Atualização parcial de funcionário — todos os campos são opcionais. */
export class UpdateFuncionarioDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'nome deve ter ao menos 2 caracteres' })
  nome?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{11,14}$/, {
    message: 'cpf deve conter de 11 a 14 dígitos (somente números)',
  })
  cpf?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'funcao deve ter ao menos 2 caracteres' })
  funcao?: string;

  @IsOptional()
  @IsString()
  turno?: string;
}
