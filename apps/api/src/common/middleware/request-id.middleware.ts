import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { randomBytes } from 'crypto';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request & { id?: string }, res: Response, next: NextFunction): void {
    const incoming = req.header('x-request-id');
    const requestId =
      incoming && incoming.trim().length > 0
        ? incoming
        : `req_${randomBytes(4).toString('hex')}`;

    req.id = requestId;
    res.setHeader('X-Request-Id', requestId);
    next();
  }
}
