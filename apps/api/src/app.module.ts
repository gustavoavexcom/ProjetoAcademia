import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AlunosModule } from './alunos/alunos.module';
import { FuncionariosModule } from './funcionarios/funcionarios.module';
import { ExerciciosModule } from './exercicios/exercicios.module';
import { PlanosModule } from './planos/planos.module';
import { MensalidadesModule } from './mensalidades/mensalidades.module';
import { NotasModule } from './notas/notas.module';
import { TreinosModule } from './treinos/treinos.module';
import { AvaliacoesModule } from './avaliacoes/avaliacoes.module';
import { AcessosModule } from './acessos/acessos.module';
import { RecomendacoesModule } from './recomendacoes/recomendacoes.module';
import { AgendamentosModule } from './agendamentos/agendamentos.module';
import { NotificacoesModule } from './notificacoes/notificacoes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AlunosModule,
    FuncionariosModule,
    ExerciciosModule,
    PlanosModule,
    MensalidadesModule,
    NotasModule,
    TreinosModule,
    AvaliacoesModule,
    AcessosModule,
    RecomendacoesModule,
    AgendamentosModule,
    NotificacoesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
