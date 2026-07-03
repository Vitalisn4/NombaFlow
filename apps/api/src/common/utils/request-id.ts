import { randomBytes } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

export function resolveRequestId(
  req: IncomingMessage,
  res?: ServerResponse,
): string {
  const incoming = req.headers['x-request-id'];
  const header =
    typeof incoming === 'string'
      ? incoming
      : Array.isArray(incoming)
        ? incoming[0]
        : undefined;

  const requestId =
    header && header.trim().length > 0
      ? header.trim()
      : `req_${randomBytes(4).toString('hex')}`;

  if (res && !res.headersSent) {
    res.setHeader('X-Request-Id', requestId);
  }

  return requestId;
}
