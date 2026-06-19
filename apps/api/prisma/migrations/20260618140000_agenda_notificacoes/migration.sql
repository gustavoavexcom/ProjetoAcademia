-- AlterTable: data de vencimento do plano contratado (avisos do painel)
ALTER TABLE "alunos" ADD COLUMN "vencimentoPlano" TIMESTAMP(3);

-- CreateTable: agendamentos de aulas e atividades (MOD-09)
CREATE TABLE "agendamentos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "atendente" TEXT NOT NULL,
    "observacao" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agendamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable: notificações e lembretes aos alunos (MOD-10)
CREATE TABLE "notificacoes" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notificacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agendamentos_data_idx" ON "agendamentos"("data");
