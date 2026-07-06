import { HttpStatus, Injectable } from '@nestjs/common';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { ApiException } from '../../common/errors/api.exception';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MerchantsService {
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
}
