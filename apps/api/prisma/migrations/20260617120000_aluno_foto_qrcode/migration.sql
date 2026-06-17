-- AlterTable: foto capturada no cadastro e token único para o QR code da catraca
ALTER TABLE "alunos" ADD COLUMN     "fotoBase64" TEXT,
ADD COLUMN     "qrCode" TEXT;

-- Backfill: gera um token para alunos já existentes
UPDATE "alunos" SET "qrCode" = gen_random_uuid()::text WHERE "qrCode" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "alunos_qrCode_key" ON "alunos"("qrCode");
