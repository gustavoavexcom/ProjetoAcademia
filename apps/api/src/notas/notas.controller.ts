import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { NotasService } from './notas.service';
import { EmitirNotaDto } from './dto/emitir-nota.dto';

@Controller('notas')
export class NotasController {
  constructor(private readonly notasService: NotasService) {}

  @Post('emitir')
  emitir(@Body() dto: EmitirNotaDto) {
    return this.notasService.emitir(dto);
  }

  @Get()
  findAll() {
    return this.notasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notasService.findOne(id);
  }

  @Patch(':id/cancelar')
  cancelar(@Param('id') id: string) {
    return this.notasService.cancelar(id);
  }
}
