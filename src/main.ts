import { Logger, StandardSchemaValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule, ObserveInstrument } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    instrument: ObserveInstrument,
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port', 3000);
  const corsOrigin = configService.get<string>(
    'corsOrigin',
    'http://localhost:8081',
  );

  app.set('trust proxy', 'loopback');
  app.useSecurityHeaders({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  });
  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableCors({
    origin:
      corsOrigin === '*'
        ? true
        : corsOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  app.useGlobalPipes(new StandardSchemaValidationPipe());

  await app.listen(port, '0.0.0.0');
  Logger.log(`Zynstitch API listening on port ${port}`, 'Bootstrap');
}

await bootstrap();
