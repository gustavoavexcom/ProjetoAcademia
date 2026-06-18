-- CreateEnum: objetivo de treino da avaliação física (MOD-07)
CREATE TYPE "ObjetivoTreino" AS ENUM ('FORCA_SUPERIOR', 'FORCA_INFERIOR', 'ABDOMEN_DEFINIDO');

-- AlterTable: endereço do aluno (autopreenchido via ViaCEP)
ALTER TABLE "alunos" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "cidade" TEXT,
ADD COLUMN     "logradouro" TEXT,
ADD COLUMN     "numero" TEXT,
ADD COLUMN     "uf" TEXT;

-- AlterTable: objetivo de treino na avaliação física
ALTER TABLE "avaliacoes_fisicas" ADD COLUMN     "objetivo" "ObjetivoTreino";
