import { Body, Controller, Get, Post } from '@nestjs/common';
import { RecomendacoesService } from './recomendacoes.service';
import { GerarRecomendacaoDto } from './dto/gerar-recomendacao.dto';

@Controller('recomendacoes')
export class RecomendacoesController {
  constructor(private readonly recomendacoesService: RecomendacoesService) {}

  @Get('objetivos')
  listarObjetivos() {
    return this.recomendacoesService.listarObjetivos();
  }

  @Post()
  gerar(@Body() dto: GerarRecomendacaoDto) {
    return this.recomendacoesService.gerar(dto);
  }
}
