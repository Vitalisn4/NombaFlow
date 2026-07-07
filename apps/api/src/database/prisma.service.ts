import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createPrismaClient, PrismaClient } from '@nombaflow/database';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly client: PrismaClient;

  constructor() {
    this.client = createPrismaClient(process.env.DATABASE_URL);
  }

  get merchant(): PrismaClient['merchant'] {
    return this.client.merchant;
  }

  get plan(): PrismaClient['plan'] {
    return this.client.plan;
  }

  get subscription(): PrismaClient['subscription'] {
    return this.client.subscription;
  }

  get webhookEvent(): PrismaClient['webhookEvent'] {
    return this.client.webhookEvent;
  }

  async onModuleInit(): Promise<void> {
    await this.client.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.$disconnect();
  }
}
