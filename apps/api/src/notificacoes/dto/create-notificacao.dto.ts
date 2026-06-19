import { IsString, MinLength } from 'class-validator';

export class CreateNotificacaoDto {
  @IsString()
  @MinLength(2, { message: 'titulo deve ter ao menos 2 caracteres' })
  titulo!: string;

  @IsString()
  @MinLength(2, { message: 'tipo deve ter ao menos 2 caracteres' })
  tipo!: string;

  @IsString()
  @MinLength(2, { message: 'mensagem deve ter ao menos 2 caracteres' })
  mensagem!: string;
}
