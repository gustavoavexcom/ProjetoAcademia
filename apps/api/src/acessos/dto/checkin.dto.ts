import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { TipoAcesso } from '@academia/shared';

/**
 * Check-in/check-out feito pela catraca a partir da leitura do QR code do aluno.
 * O QR code carrega o token único (`qrCode`) gerado no cadastro do aluno.
 */
export class CheckinDto {
  @IsString()
  @MinLength(8, { message: 'qrCode inválido' })
  qrCode!: string;

  @IsOptional()
  @IsEnum(TipoAcesso, { message: 'tipo deve ser ENTRADA ou SAIDA' })
  tipo?: TipoAcesso;
}
