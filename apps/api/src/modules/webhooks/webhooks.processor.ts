import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type { WebhookQueueJobData } from './types/nomba-webhook.types';

@Injectable()
export class WebhooksProcessor {
  private readonly logger = new Logger(WebhooksProcessor.name);

  constructor(private readonly prisma: PrismaService) {}

  async process(job: WebhookQueueJobData): Promise<void> {
    const { webhookEventId, eventId, eventType } = job;

    try {
      switch (eventType) {
        case 'payment_success':
          this.logger.log(`Processing payment_success for ${eventId}`);
          break;
        case 'payment_failed':
          this.logger.log(`Processing payment_failed for ${eventId}`);
          break;
        case 'payout_success':
          this.logger.log(`Processing payout_success for ${eventId}`);
          break;
        case 'payout_failed':
          this.logger.log(`Processing payout_failed for ${eventId}`);
          break;
        default:
          this.logger.log(`Unhandled Nomba webhook event type: ${eventType}`);
      }

      await this.prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';

      await this.prisma.webhookEvent.update({
        where: { id: webhookEventId },
        data: {
          processingError: message,
        },
      });

      throw error;
    }
  }
}
