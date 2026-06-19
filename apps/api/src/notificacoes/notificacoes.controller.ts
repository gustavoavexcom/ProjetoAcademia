import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { CreateNotificacaoDto } from './dto/create-notificacao.dto';
import { UpdateNotificacaoDto } from './dto/update-notificacao.dto';

@Controller('notificacoes')
export class NotificacoesController {
  constructor(private readonly notificacoesService: NotificacoesService) {}

  @Post()
  create(@Body() dto: CreateNotificacaoDto) {
    return this.notificacoesService.create(dto);
  }

  @Get()
  findAll() {
    return this.notificacoesService.findAll();
  }

  // Rota agregada do painel principal — declarada antes de :id para não conflitar.
  @Get('painel')
  painel() {
    return this.notificacoesService.painel();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificacoesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateNotificacaoDto) {
    return this.notificacoesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificacoesService.remove(id);
  }
}
