import './load-env';
import 'reflect-metadata';
import helmet from 'helmet';
import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';
import { loadEnv } from './config/env';

async function bootstrap() {
  const env = loadEnv();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.useLogger(app.get(Logger));
  app.use(helmet());
  app.enableCors({
    origin: env.FRONTEND_URL,
    credentials: true,
  });

  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  await app.listen(env.PORT, '0.0.0.0');
}

bootstrap().catch((err: unknown) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
