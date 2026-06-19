import { IsOptional, IsString, MinLength } from 'class-validator';

/** Atualização parcial de notificação — todos os campos são opcionais. */
export class UpdateNotificacaoDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'titulo deve ter ao menos 2 caracteres' })
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'tipo deve ter ao menos 2 caracteres' })
  tipo?: string;

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'mensagem deve ter ao menos 2 caracteres' })
  mensagem?: string;
}
