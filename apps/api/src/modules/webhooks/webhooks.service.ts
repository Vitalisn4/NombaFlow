import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@nombaflow/database';
import { PrismaService } from '../../database/prisma.service';
import { loadEnv } from '../../config/env';
import { verifyNombaWebhookSignature } from './nomba-webhook.verifier';
import type { NombaWebhookPayload } from './types/nomba-webhook.types';
import { WebhookQueueService } from '../../queue/webhook-queue.service';

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly env = loadEnv();

  constructor(
    private readonly prisma: PrismaService,
    private readonly webhookQueue: WebhookQueueService,
  ) {}

  async acceptWebhook(
    payload: NombaWebhookPayload,
    signature: string | undefined,
    timestamp: string | undefined,
  ): Promise<void> {
    const isValid = verifyNombaWebhookSignature(
      payload,
      signature,
      timestamp,
      this.env.NOMBA_WEBHOOK_SECRET,
    );

    if (!isValid) {
      this.logger.warn('Invalid Nomba webhook signature received');
      return;
    }

    const eventId = payload.requestId;
    const eventType = payload.event_type;

    if (!eventId || !eventType) {
      this.logger.warn('Nomba webhook missing requestId or event_type');
      return;
    }

    const duplicate = await this.prisma.webhookEvent.findUnique({
      where: { nombaEventId: eventId },
      select: { id: true },
    });

    if (duplicate) {
      this.logger.log(`Duplicate webhook ignored: ${eventId}`);
      return;
    }

    try {
      const webhookEvent = await this.prisma.webhookEvent.create({
        data: {
          nombaEventId: eventId,
          eventType,
          payload: payload as Prisma.InputJsonValue,
          processed: false,
        },
      });

      await this.webhookQueue.enqueue({
        webhookEventId: webhookEvent.id,
        eventId,
        eventType,
      });

      this.logger.log(`Queued Nomba webhook ${eventType} (${eventId})`);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.log(`Duplicate webhook ignored: ${eventId}`);
        return;
      }

      throw error;
    }
  }
}
