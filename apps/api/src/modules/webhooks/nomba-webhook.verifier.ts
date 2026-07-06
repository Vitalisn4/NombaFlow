import { createHmac } from 'node:crypto';
import type { NombaWebhookPayload } from './types/nomba-webhook.types';

function buildNombaHashingPayload(
  payload: NombaWebhookPayload,
  nombaTimestamp: string,
): string {
  const data = payload.data ?? {};
  const merchant = data.merchant ?? {};
  const transaction = data.transaction ?? {};

  const eventType = payload.event_type ?? '';
  const requestId = payload.requestId ?? '';
  const userId = merchant.userId ?? '';
  const walletId = merchant.walletId ?? '';
  const transactionId = transaction.transactionId ?? '';
  const transactionType = transaction.type ?? '';
  const transactionTime = transaction.time ?? '';
  let responseCode = transaction.responseCode ?? '';

  if (responseCode === 'null') {
    responseCode = '';
  }

  return `${eventType}:${requestId}:${userId}:${walletId}:${transactionId}:${transactionType}:${transactionTime}:${responseCode}:${nombaTimestamp}`;
}

export function computeNombaWebhookSignature(
  payload: NombaWebhookPayload,
  nombaTimestamp: string,
  secret: string,
): string {
  const hashingPayload = buildNombaHashingPayload(payload, nombaTimestamp);
  return createHmac('sha256', secret).update(hashingPayload).digest('base64');
}

export function verifyNombaWebhookSignature(
  payload: NombaWebhookPayload,
  nombaSignature: string | undefined,
  nombaTimestamp: string | undefined,
  secret: string,
): boolean {
  if (!nombaSignature || !nombaTimestamp) {
    return false;
  }

  const computed = computeNombaWebhookSignature(payload, nombaTimestamp, secret);

  return nombaSignature.toLowerCase() === computed.toLowerCase();
}
