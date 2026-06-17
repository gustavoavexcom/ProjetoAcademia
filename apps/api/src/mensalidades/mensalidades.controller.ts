import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { MensalidadesService } from './mensalidades.service';
import { GerarMensalidadeDto } from './dto/gerar-mensalidade.dto';

@Controller('mensalidades')
export class MensalidadesController {
  constructor(private readonly mensalidadesService: MensalidadesService) {}

  @Post('gerar')
  gerar(@Body() dto: GerarMensalidadeDto) {
    return this.mensalidadesService.gerar(dto);
  }

  @Get()
  findAll() {
    return this.mensalidadesService.findAll();
  }

  @Get('inadimplentes')
  inadimplentes() {
    return this.mensalidadesService.inadimplentes();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mensalidadesService.findOne(id);
  }

  @Patch(':id/pagar')
  pagar(@Param('id') id: string) {
    return this.mensalidadesService.pagar(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.mensalidadesService.remove(id);
  }
}
