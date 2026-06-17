/**
 * Seed — importação do histórico real da academia (historico_academia.csv).
 *
 * O CSV traz dados "sujos" (CPF/CNPJ misturados e duplicados, telefones em formatos
 * variados, datas DD/MM/AAAA e DD-MM-AAAA, status fora do enum). Aqui normalizamos e
 * deduplicamos antes de gravar. Idempotente: limpa as tabelas no início.
 *
 * Rodar: pnpm --filter @academia/api prisma:seed
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PrismaClient, Prisma, StatusAluno } from '@prisma/client';

const prisma = new PrismaClient();

// Caminho do CSV na raiz do monorepo (este arquivo vive em apps/api/prisma).
const CSV_PATH = resolve(__dirname, '../../../historico_academia.csv');

/** Textos que representam "telefone ausente". */
const TELEFONE_INVALIDO = [
  'nao informado',
  'não informado',
  'sem fone',
  'nao tem',
  'não tem',
  'falar com assessoria',
];

const STATUS_MAP: Record<string, StatusAluno> = {
  ativo: StatusAluno.ATIVO,
  inativo: StatusAluno.INATIVO,
  suspenso: StatusAluno.SUSPENSO,
  trancado: StatusAluno.TRANCADO,
  cancelado: StatusAluno.CANCELADO,
};

interface LinhaCsv {
  dataMatricula: string;
  nome: string;
  documento: string;
  telefone: string;
  plano: string;
  valorMensal: string;
  status: string;
}

/** Remove tudo que não for dígito. */
function apenasDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** Normaliza telefone: dígitos, ou null quando ausente/inválido. */
function normalizaTelefone(valor: string): string | null {
  const limpo = valor.trim().toLowerCase();
  if (!limpo || TELEFONE_INVALIDO.includes(limpo)) return null;
  const digitos = apenasDigitos(valor);
  return digitos.length >= 8 ? digitos : null;
}

/** Converte "DD/MM/AAAA" ou "DD-MM-AAAA" em Date (ou null se inválida). */
function normalizaData(valor: string): Date | null {
  const partes = valor.trim().split(/[/-]/);
  if (partes.length !== 3) return null;
  const [dia, mes, ano] = partes.map((p) => Number(p));
  if (!dia || !mes || !ano) return null;
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return Number.isNaN(data.getTime()) ? null : data;
}

/** "120,00" -> 120.00 (Decimal). */
function normalizaValor(valor: string): Prisma.Decimal {
  const normalizado = valor.trim().replace(/\./g, '').replace(',', '.');
  return new Prisma.Decimal(normalizado || '0');
}

function normalizaStatus(valor: string): StatusAluno {
  return STATUS_MAP[valor.trim().toLowerCase()] ?? StatusAluno.ATIVO;
}

/** Parsing simples do CSV (separador ';', sem aspas/escapes no arquivo). */
function lerCsv(): LinhaCsv[] {
  const conteudo = readFileSync(CSV_PATH, 'utf-8');
  const linhas = conteudo
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  linhas.shift(); // remove cabeçalho

  return linhas.map((linha) => {
    const cols = linha.split(';');
    return {
      // cols[0] = ID original (ignorado — usamos uuid)
      dataMatricula: cols[1] ?? '',
      nome: cols[2] ?? '',
      documento: cols[3] ?? '',
      telefone: cols[4] ?? '',
      plano: cols[5] ?? '',
      valorMensal: cols[6] ?? '',
      status: cols[7] ?? '',
    };
  });
}

async function limparBanco() {
  // Ordem respeita as foreign keys.
  await prisma.notaFiscal.deleteMany();
  await prisma.exercicioTreino.deleteMany();
  await prisma.treino.deleteMany();
  await prisma.avaliacaoFisica.deleteMany();
  await prisma.acesso.deleteMany();
  await prisma.mensalidade.deleteMany();
  await prisma.aluno.deleteMany();
  await prisma.plano.deleteMany();
}

async function main() {
  console.log(`Lendo CSV: ${CSV_PATH}`);
  const linhas = lerCsv();
  console.log(`Linhas lidas: ${linhas.length}`);

  await limparBanco();

  // 1) Planos distintos (chave = nome; primeiro valor visto).
  const planosPorNome = new Map<string, Prisma.Decimal>();
  for (const linha of linhas) {
    const nome = linha.plano.trim();
    if (nome && !planosPorNome.has(nome)) {
      planosPorNome.set(nome, normalizaValor(linha.valorMensal));
    }
  }

  const idPlanoPorNome = new Map<string, string>();
  for (const [nome, valor] of planosPorNome) {
    const plano = await prisma.plano.create({
      data: { nome, valorMensal: valor, descricao: 'Importado do histórico' },
    });
    idPlanoPorNome.set(nome, plano.id);
  }
  console.log(`Planos criados: ${idPlanoPorNome.size}`);

  // 2) Alunos (deduplicados por CPF/CNPJ).
  const cpfsVistos = new Set<string>();
  let importados = 0;
  let duplicados = 0;
  let semDocumento = 0;

  for (const linha of linhas) {
    const cpf = apenasDigitos(linha.documento);
    if (!cpf) {
      semDocumento++;
      continue;
    }
    if (cpfsVistos.has(cpf)) {
      duplicados++;
      continue;
    }
    cpfsVistos.add(cpf);

    await prisma.aluno.create({
      data: {
        nome: linha.nome.trim(),
        cpf,
        telefone: normalizaTelefone(linha.telefone),
        status: normalizaStatus(linha.status),
        dataMatricula: normalizaData(linha.dataMatricula),
        planoId: idPlanoPorNome.get(linha.plano.trim()) ?? null,
      },
    });
    importados++;
  }

  console.log(
    `Alunos importados: ${importados} | duplicados ignorados: ${duplicados} | sem documento: ${semDocumento}`,
  );
}

main()
  .catch((e) => {
    console.error('Falha no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
