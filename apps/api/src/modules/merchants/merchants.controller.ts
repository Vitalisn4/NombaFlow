import { Controller, Get, UseGuards } from '@nestjs/common';
import { MerchantId } from '../auth/decorators/merchant-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MerchantsService } from './merchants.service';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@MerchantId() merchantId: string) {
    return this.merchantsService.getMe(merchantId);
  }
}
