export type NombaWebhookPayload = {
  event_type?: string;
  requestId?: string;
  data?: {
    merchant?: {
      userId?: string;
      walletId?: string;
      walletBalance?: number;
    };
    transaction?: {
      transactionId?: string;
      type?: string;
      transactionAmount?: number;
      time?: string;
      responseCode?: string;
    };
    tokenizedCardData?: {
      tokenKey?: string;
      cardType?: string;
      cardPan?: string;
    };
  };
};

export type WebhookQueueJobData = {
  webhookEventId: string;
  eventId: string;
  eventType: string;
};

export const NOMBA_WEBHOOK_EVENT_TYPES = [
  'payment_success',
  'payment_failed',
  'payout_success',
  'payout_failed',
  'payment_reversal',
  'payout_refund',
] as const;

export type NombaWebhookEventType = (typeof NOMBA_WEBHOOK_EVENT_TYPES)[number];
