import { HttpException, HttpStatus } from '@nestjs/common';
import type { ApiErrorCode } from './api-error-code';

export class ApiException extends HttpException {
  constructor(
    public readonly code: ApiErrorCode,
    message: string,
    statusCode: HttpStatus,
  ) {
    super({ code, message }, statusCode);
  }
}
