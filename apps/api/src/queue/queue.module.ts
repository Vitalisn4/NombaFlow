import { Global, Module, forwardRef } from '@nestjs/common';
import { WebhooksModule } from '../modules/webhooks/webhooks.module';
import { WebhookQueueService } from './webhook-queue.service';

@Global()
@Module({
  imports: [forwardRef(() => WebhooksModule)],
  providers: [WebhookQueueService],
  exports: [WebhookQueueService],
})
export class QueueModule {}
