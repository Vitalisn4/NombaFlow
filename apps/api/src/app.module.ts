import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { LoggerModule } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { resolveRequestId } from './common/utils/request-id';
import { HealthModule } from './health/health.module';
import { SmokeModule } from './smoke/smoke.module';

const isProduction = process.env.NODE_ENV === 'production';

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
    HealthModule,
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
