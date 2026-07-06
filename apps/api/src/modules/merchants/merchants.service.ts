import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { ApiException } from '../../common/errors/api.exception';
import { loadEnv } from '../../config/env';
import { encrypt } from '../../common/utils/encryption';
import { NombaClient, NombaApiError } from '../nomba/nomba-client';
import type { NombaCredentialsResponse } from './dto/nomba-credentials.dto';

@Injectable()
export class MerchantsService {
  private readonly env = loadEnv();
  private readonly nombaClient = new NombaClient(this.env.NOMBA_BASE_URL);

  constructor(private readonly prisma: PrismaService) {}

  async getMe(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });
    if (!merchant) {
      throw new ApiException(
        ApiErrorCode.NOT_FOUND,
        'Merchant not found.',
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      id: merchant.id,
      businessName: merchant.businessName,
      email: merchant.email,
      nombaConnected: merchant.nombaConnected,
      createdAt: merchant.createdAt.toISOString(),
    };
  }

  async connectNombaCredentials(
    merchantId: string,
    clientId: string,
    clientSecret: string,
    accountId: string,
  ): Promise<NombaCredentialsResponse> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new ApiException(
        ApiErrorCode.NOT_FOUND,
        'Merchant not found.',
        HttpStatus.NOT_FOUND,
      );
    }

    let tokenData;
    try {
      tokenData = await this.nombaClient.issueToken(clientId, clientSecret, accountId);
    } catch (error) {
      if (error instanceof NombaApiError) {
        throw new ApiException(
          ApiErrorCode.INVALID_NOMBA_CREDENTIALS,
          `Nomba rejected these credentials: ${error.description}`,
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      }
      throw new ApiException(
        ApiErrorCode.INVALID_NOMBA_CREDENTIALS,
        'Could not connect to Nomba with the provided credentials.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const encryptionKey = this.env.ENCRYPTION_KEY;

    await this.prisma.merchant.update({
      where: { id: merchantId },
      data: {
        nombaClientId: clientId,
        nombaClientSecret: encrypt(clientSecret, encryptionKey),
        nombaAccountId: accountId,
        nombaAccessToken: encrypt(tokenData.access_token, encryptionKey),
        nombaRefreshToken: encrypt(tokenData.refresh_token, encryptionKey),
        nombaTokenExpiresAt: new Date(tokenData.expiresAt),
        nombaConnected: true,
        nombaConnectedAt: new Date(),
      },
    });

    return { connected: true };
  }
}