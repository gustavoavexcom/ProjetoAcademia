import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { API_PREFIX } from '@academia/shared';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.setGlobalPrefix(API_PREFIX);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // CORS configurável — em produção o front roda em outra origem (deploy separado).
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  // Host explícito ('0.0.0.0') para aceitar conexões externas (containers/deploy).
  await app.listen(port, '0.0.0.0');
  // eslint-disable-next-line no-console
  console.log(`API do Sistema de Academia em http://localhost:${port}/${API_PREFIX}`);
}

void bootstrap();
