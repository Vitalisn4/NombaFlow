import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MerchantsController } from './merchants.controller';
import { MerchantsService } from './merchants.service';
import { TokenRefreshProcessor } from './nomba-token-refresh.processor';
import { TokenRefreshScheduler } from './nomba-token-refresh.scheduler';

@Module({
  imports: [AuthModule, BullModule.registerQueue({ name: 'nomba-token-refresh' })],
  controllers: [MerchantsController],
  providers: [MerchantsService, TokenRefreshProcessor, TokenRefreshScheduler],
})
export class MerchantsModule {}