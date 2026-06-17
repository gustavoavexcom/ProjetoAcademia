import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { AvaliacoesService } from './avaliacoes.service';
import { CreateAvaliacaoDto } from './dto/create-avaliacao.dto';
import { UpdateAvaliacaoDto } from './dto/update-avaliacao.dto';

@Controller('avaliacoes')
export class AvaliacoesController {
  constructor(private readonly avaliacoesService: AvaliacoesService) {}

  @Post()
  create(@Body() dto: CreateAvaliacaoDto) {
    return this.avaliacoesService.create(dto);
  }

  @Get()
  findAll(@Query('alunoId') alunoId?: string) {
    return this.avaliacoesService.findAll(alunoId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.avaliacoesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAvaliacaoDto) {
    return this.avaliacoesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.avaliacoesService.remove(id);
  }
}
