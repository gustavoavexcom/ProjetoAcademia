import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

/** Solicitação de emissão de NFS-e (simulada). */
export class EmitirNotaDto {
  @IsUUID('all', { message: 'alunoId inválido' })
  alunoId!: string;

  @IsOptional()
  @IsUUID('all', { message: 'mensalidadeId inválido' })
  mensalidadeId?: string;

  /** Opcional quando há mensalidade vinculada (valor herdado dela). */
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'valor deve ser numérico' })
  @Min(0)
  valor?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  descricaoServico?: string;
}
