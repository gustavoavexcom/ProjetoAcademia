-- AlterTable: número de matrícula sequencial e amigável para o aluno.
-- SERIAL cria a sequence e faz o backfill dos registros já existentes automaticamente.
ALTER TABLE "alunos" ADD COLUMN "matricula" SERIAL NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "alunos_matricula_key" ON "alunos"("matricula");
