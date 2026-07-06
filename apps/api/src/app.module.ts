import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { BullModule } from '@nestjs/bullmq';
import { LoggerModule } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { resolveRequestId } from './common/utils/request-id';
import { loadEnv } from './config/env';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { SmokeModule } from './smoke/smoke.module';

const isProduction = process.env.NODE_ENV === 'production';

function parseRedisUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    tls: parsed.protocol === 'rediss:' ? {} : undefined,
  };
}

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  colorize: true,
                },
              }
            : undefined,
        genReqId: (req, res) => resolveRequestId(req, res),
        autoLogging: {
          ignore: (req) => req.url === '/health',
        },
        customProps: (req) => ({
          requestId: req.id,
        }),
      },
    }),
    BullModule.forRoot({
      connection: {
        ...parseRedisUrl(loadEnv().REDIS_URL),
        maxRetriesPerRequest: null,
      },
    }),
    HealthModule,
    DatabaseModule,
    AuthModule,
    MerchantsModule,
    ...(isProduction ? [] : [SmokeModule]),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}