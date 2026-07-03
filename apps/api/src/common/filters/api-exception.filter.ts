import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ZodValidationException } from 'nestjs-zod';
import type { Request, Response } from 'express';
import { ApiErrorCode } from '../errors/api-error-code';
import { ApiException } from '../errors/api.exception';

type ErrorBody = {
  error: {
    code: string;
    message: string;
    requestId: string;
    timestamp: string;
  };
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    const requestId = request.id ?? 'req_unknown';
    const timestamp = new Date().toISOString();

    const { status, code, message } = this.resolveException(exception);

    const body: ErrorBody = {
      error: {
        code,
        message,
        requestId,
        timestamp,
      },
    };

    response.status(status).json(body);
  }

  private resolveException(exception: unknown): {
    status: number;
    code: string;
    message: string;
  } {
    if (exception instanceof ApiException) {
      const payload = exception.getResponse();
      const message =
        typeof payload === 'object' && payload !== null && 'message' in payload
          ? String((payload as { message: string }).message)
          : exception.message;
      return {
        status: exception.getStatus(),
        code: exception.code,
        message,
      };
    }

    if (exception instanceof ZodValidationException) {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: ApiErrorCode.VALIDATION_ERROR,
        message: this.formatZodMessage(exception),
      };
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      const message = this.extractHttpMessage(payload, exception.message);
      const code = this.mapStatusToCode(status);
      return { status, code, message };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: ApiErrorCode.INTERNAL_ERROR,
      message: 'An unexpected error occurred.',
    };
  }

  private formatZodMessage(exception: ZodValidationException): string {
    const zodError = exception.getZodError();
    const first = zodError.issues[0];
    if (!first) {
      return 'Request body failed validation.';
    }
    const path = first.path.length > 0 ? `${first.path.join('.')}: ` : '';
    return `${path}${first.message}`;
  }

  private extractHttpMessage(
    payload: string | object,
    fallback: string,
  ): string {
    if (typeof payload === 'string') {
      return payload;
    }
    if (typeof payload === 'object' && payload !== null) {
      if ('message' in payload) {
        const message = (payload as { message: string | string[] }).message;
        return Array.isArray(message) ? message.join(', ') : String(message);
      }
      if ('code' in payload && 'message' in payload) {
        return String((payload as { message: string }).message);
      }
    }
    return fallback;
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ApiErrorCode.VALIDATION_ERROR;
      case HttpStatus.UNAUTHORIZED:
        return ApiErrorCode.UNAUTHORIZED;
      case HttpStatus.FORBIDDEN:
        return ApiErrorCode.FORBIDDEN;
      case HttpStatus.NOT_FOUND:
        return ApiErrorCode.NOT_FOUND;
      case HttpStatus.CONFLICT:
        return ApiErrorCode.DUPLICATE_CUSTOMER;
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return ApiErrorCode.INVALID_NOMBA_CREDENTIALS;
      case HttpStatus.TOO_MANY_REQUESTS:
        return ApiErrorCode.RATE_LIMITED;
      case HttpStatus.BAD_GATEWAY:
        return ApiErrorCode.NOMBA_API_ERROR;
      default:
        return ApiErrorCode.INTERNAL_ERROR;
    }
  }
}
