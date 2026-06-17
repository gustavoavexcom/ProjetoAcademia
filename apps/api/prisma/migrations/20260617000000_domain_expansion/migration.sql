-- CreateEnum
CREATE TYPE "StatusNota" AS ENUM ('EMITIDA', 'CANCELADA');

-- AlterEnum
ALTER TYPE "StatusAluno" ADD VALUE 'TRANCADO';
ALTER TYPE "StatusAluno" ADD VALUE 'CANCELADO';

-- AlterTable
ALTER TABLE "alunos" ADD COLUMN     "dataMatricula" TIMESTAMP(3),
ADD COLUMN     "planoId" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "avaliacoes_fisicas" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pesoKg" DECIMAL(5,2),
    "alturaCm" INTEGER,
    "percentualGordura" DECIMAL(5,2),
    "massaMuscularKg" DECIMAL(5,2),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "avaliacoes_fisicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "treinos" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "objetivo" TEXT,
    "instrutor" TEXT,
    "alunoId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "treinos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercicios_treino" (
    "id" TEXT NOT NULL,
    "treinoId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "series" INTEGER,
    "repeticoes" TEXT,
    "cargaKg" DECIMAL(6,2),

    CONSTRAINT "exercicios_treino_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notas_fiscais" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "mensalidadeId" TEXT,
    "numero" TEXT NOT NULL,
    "protocolo" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "descricaoServico" TEXT NOT NULL,
    "status" "StatusNota" NOT NULL DEFAULT 'EMITIDA',
    "emitidaEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notas_fiscais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "avaliacoes_fisicas_alunoId_idx" ON "avaliacoes_fisicas"("alunoId");

-- CreateIndex
CREATE INDEX "treinos_alunoId_idx" ON "treinos"("alunoId");

-- CreateIndex
CREATE INDEX "exercicios_treino_treinoId_idx" ON "exercicios_treino"("treinoId");

-- CreateIndex
CREATE UNIQUE INDEX "notas_fiscais_numero_key" ON "notas_fiscais"("numero");

-- CreateIndex
CREATE INDEX "notas_fiscais_alunoId_idx" ON "notas_fiscais"("alunoId");

-- CreateIndex
CREATE INDEX "alunos_planoId_idx" ON "alunos"("planoId");

-- CreateIndex
CREATE UNIQUE INDEX "planos_nome_key" ON "planos"("nome");

-- AddForeignKey
ALTER TABLE "alunos" ADD CONSTRAINT "alunos_planoId_fkey" FOREIGN KEY ("planoId") REFERENCES "planos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "avaliacoes_fisicas" ADD CONSTRAINT "avaliacoes_fisicas_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "treinos" ADD CONSTRAINT "treinos_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercicios_treino" ADD CONSTRAINT "exercicios_treino_treinoId_fkey" FOREIGN KEY ("treinoId") REFERENCES "treinos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fiscais" ADD CONSTRAINT "notas_fiscais_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "alunos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notas_fiscais" ADD CONSTRAINT "notas_fiscais_mensalidadeId_fkey" FOREIGN KEY ("mensalidadeId") REFERENCES "mensalidades"("id") ON DELETE SET NULL ON UPDATE CASCADE;
