import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Conectado ao PostgreSQL.');
    } catch (error) {
      // Não derruba a aplicação no boot — Prisma reconecta na primeira query.
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Banco indisponível no boot (${message}). Verifique DATABASE_URL.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
