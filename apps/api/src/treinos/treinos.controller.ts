import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { TreinosService } from './treinos.service';
import { CreateTreinoDto } from './dto/create-treino.dto';
import { UpdateTreinoDto } from './dto/update-treino.dto';
import { AtribuirTreinoDto } from './dto/atribuir-treino.dto';

@Controller('treinos')
export class TreinosController {
  constructor(private readonly treinosService: TreinosService) {}

  @Post()
  create(@Body() dto: CreateTreinoDto) {
    return this.treinosService.create(dto);
  }

  @Get()
  findAll() {
    return this.treinosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.treinosService.findOne(id);
  }

  @Patch(':id/atribuir')
  atribuir(@Param('id') id: string, @Body() dto: AtribuirTreinoDto) {
    return this.treinosService.atribuir(id, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTreinoDto) {
    return this.treinosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.treinosService.remove(id);
  }
}
