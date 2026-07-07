import { Module, forwardRef } from '@nestjs/common';
import { QueueModule } from '../../queue/queue.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksProcessor } from './webhooks.processor';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [forwardRef(() => QueueModule)],
  controllers: [WebhooksController],
  providers: [WebhooksService, WebhooksProcessor],
  exports: [WebhooksProcessor],
})
export class WebhooksModule {}
