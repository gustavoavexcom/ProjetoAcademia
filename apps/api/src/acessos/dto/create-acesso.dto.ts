import { IsEnum, IsUUID } from 'class-validator';
import { TipoAcesso } from '@academia/shared';

/** Registro de passagem na catraca (entrada/saída). */
export class CreateAcessoDto {
  @IsUUID('all', { message: 'alunoId inválido' })
  alunoId!: string;

  @IsEnum(TipoAcesso, { message: 'tipo deve ser ENTRADA ou SAIDA' })
  tipo!: TipoAcesso;
}
