import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AgendamentosService } from './agendamentos.service';
import { CreateAgendamentoDto } from './dto/create-agendamento.dto';
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  @Post()
  create(@Body() dto: CreateAgendamentoDto) {
    return this.agendamentosService.create(dto);
  }

  @Get()
  findAll() {
    return this.agendamentosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agendamentosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgendamentoDto) {
    return this.agendamentosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.agendamentosService.remove(id);
  }
}
