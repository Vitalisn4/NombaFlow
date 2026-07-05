import { randomUUID } from 'crypto';
import type { IncomingMessage, ServerResponse } from 'http';

const REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

function isValidRequestId(value: string): boolean {
  return REQUEST_ID_PATTERN.test(value);
}

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

  const trimmed = header?.trim();
  const requestId =
    trimmed && isValidRequestId(trimmed)
      ? trimmed
      : `req_${randomUUID().replace(/-/g, '')}`;

  if (res && !res.headersSent) {
    res.setHeader('X-Request-Id', requestId);
  }

  return requestId;
}
