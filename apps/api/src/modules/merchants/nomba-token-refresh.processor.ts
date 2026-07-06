import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { decrypt, encrypt } from '../../common/utils/encryption';
import { loadEnv } from '../../config/env';
import { PrismaService } from '../../database/prisma.service';
import { NombaClient } from '../nomba/nomba-client';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

@Processor('nomba-token-refresh')
export class TokenRefreshProcessor extends WorkerHost {
  private readonly logger = new Logger(TokenRefreshProcessor.name);
  private readonly nombaClient: NombaClient;

  constructor(private readonly prisma: PrismaService) {
    super();
    this.nombaClient = new NombaClient(loadEnv().NOMBA_BASE_URL);
  }

  async process(): Promise<void> {
    const env = loadEnv();
    const expiringBefore = new Date(Date.now() + FIVE_MINUTES_MS);

    const merchants = await this.prisma.merchant.findMany({
      where: {
        nombaConnected: true,
        nombaTokenExpiresAt: { lte: expiringBefore },
      },
      select: {
        id: true,
        nombaAccountId: true,
        nombaAccessToken: true,
        nombaRefreshToken: true,
      },
    });

    this.logger.log(`Found ${merchants.length} merchant(s) needing a Nomba token refresh`);

    for (const merchant of merchants) {
      try {
        if (!merchant.nombaAccountId || !merchant.nombaAccessToken || !merchant.nombaRefreshToken) {
          this.logger.warn(`Merchant ${merchant.id} is missing Nomba token fields, skipping`);
          continue;
        }

        const accessToken = decrypt(merchant.nombaAccessToken, env.ENCRYPTION_KEY);
        const refreshToken = decrypt(merchant.nombaRefreshToken, env.ENCRYPTION_KEY);

        const result = await this.nombaClient.refreshToken(accessToken, refreshToken, merchant.nombaAccountId);

        await this.prisma.merchant.update({
          where: { id: merchant.id },
          data: {
            nombaAccessToken: encrypt(result.access_token, env.ENCRYPTION_KEY),
            nombaRefreshToken: encrypt(result.refresh_token, env.ENCRYPTION_KEY),
            nombaTokenExpiresAt: new Date(result.expiresAt),
          },
        });

        this.logger.log(`Refreshed Nomba token for merchant ${merchant.id}`);
      } catch (error) {
        this.logger.error(`Failed to refresh Nomba token for merchant ${merchant.id}`, error);
      }
    }
  }
}