import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(merchantId: string) {
    const merchant = await this.prisma.merchant.findUnique({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException('Merchant not found');
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
