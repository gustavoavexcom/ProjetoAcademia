import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AlunosService } from './alunos.service';
import { CreateAlunoDto } from './dto/create-aluno.dto';
import { UpdateAlunoDto } from './dto/update-aluno.dto';

@Controller('alunos')
export class AlunosController {
  constructor(private readonly alunosService: AlunosService) {}

  @Post()
  create(@Body() dto: CreateAlunoDto) {
    return this.alunosService.create(dto);
  }

  @Get()
  findAll() {
    return this.alunosService.findAll();
  }

  // Rota declarada antes de ':id' por clareza (não há conflito de profundidade).
  @Get('cpf/:cpf')
  findByCpf(@Param('cpf') cpf: string) {
    return this.alunosService.findByCpf(cpf);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.alunosService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAlunoDto) {
    return this.alunosService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.alunosService.remove(id);
  }
}
