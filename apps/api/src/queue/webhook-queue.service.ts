import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit, forwardRef } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { loadEnv } from '../config/env';
import { WebhooksProcessor } from '../modules/webhooks/webhooks.processor';
import type { WebhookQueueJobData } from '../modules/webhooks/types/nomba-webhook.types';
import { WEBHOOK_JOB_NAME, WEBHOOK_PROCESSING_QUEUE } from './queue.constants';

@Injectable()
export class WebhookQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(WebhookQueueService.name);
  private queue!: Queue<WebhookQueueJobData>;
  private worker!: Worker<WebhookQueueJobData>;

  constructor(
    @Inject(forwardRef(() => WebhooksProcessor))
    private readonly webhooksProcessor: WebhooksProcessor,
  ) {}

  onModuleInit(): void {
    const env = loadEnv();
    const connection = {
      url: env.REDIS_URL,
      maxRetriesPerRequest: null,
    };

    this.queue = new Queue<WebhookQueueJobData>(WEBHOOK_PROCESSING_QUEUE, {
      connection,
    });

    this.worker = new Worker<WebhookQueueJobData>(
      WEBHOOK_PROCESSING_QUEUE,
      async (job) => {
        await this.webhooksProcessor.process(job.data);
      },
      { connection },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Webhook job completed: ${job.id}`);
    });

    this.worker.on('failed', (job, error) => {
      this.logger.error(
        `Webhook job failed: ${job?.id ?? 'unknown'} — ${error.message}`,
      );
    });

    this.logger.log(`BullMQ worker listening on ${WEBHOOK_PROCESSING_QUEUE}`);
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
    await this.queue?.close();
  }

  async enqueue(data: WebhookQueueJobData): Promise<void> {
    await this.queue.add(WEBHOOK_JOB_NAME, data);
  }
}
