import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { MerchantId } from '../auth/decorators/merchant-id.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MerchantsService } from './merchants.service';
import { NombaCredentialsDto } from './dto/nomba-credentials.dto';

@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@MerchantId() merchantId: string) {
    return this.merchantsService.getMe(merchantId);
  }

  @Post('me/nomba-credentials')
  @UseGuards(JwtAuthGuard)
  connectNombaCredentials(
    @MerchantId() merchantId: string,
    @Body() dto: NombaCredentialsDto,
  ) {
    return this.merchantsService.connectNombaCredentials(
      merchantId,
      dto.clientId,
      dto.clientSecret,
      dto.accountId,
    );
  }
}