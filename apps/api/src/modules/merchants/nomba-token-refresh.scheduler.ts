import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

const TWENTY_FIVE_MINUTES_MS = 25 * 60 * 1000;

@Injectable()
export class TokenRefreshScheduler implements OnModuleInit {
  constructor(@InjectQueue('nomba-token-refresh') private readonly queue: Queue) {}

  async onModuleInit(): Promise<void> {
    await this.queue.upsertJobScheduler(
      'refresh-expiring-nomba-tokens',
      { every: TWENTY_FIVE_MINUTES_MS },
      {
        name: 'refresh-expiring-tokens',
        data: {},
      },
    );
  }
}