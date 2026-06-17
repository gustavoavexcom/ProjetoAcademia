import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { AcessosService } from './acessos.service';
import { CreateAcessoDto } from './dto/create-acesso.dto';

@Controller('acessos')
export class AcessosController {
  constructor(private readonly acessosService: AcessosService) {}

  @Post()
  registrar(@Body() dto: CreateAcessoDto) {
    return this.acessosService.registrar(dto);
  }

  @Get()
  findAll(@Query('alunoId') alunoId?: string) {
    return this.acessosService.findAll(alunoId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.acessosService.remove(id);
  }
}
