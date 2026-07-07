import { Body, Controller, Headers, Logger, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { NombaWebhookPayload } from './types/nomba-webhook.types';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('nomba')
  handleNombaWebhook(
    @Headers('nomba-signature') signature: string | undefined,
    @Headers('nomba-timestamp') timestamp: string | undefined,
    @Body() payload: NombaWebhookPayload,
    @Res() res: Response,
  ): void {
    res.status(200).send();

    void this.webhooksService
      .acceptWebhook(payload, signature, timestamp)
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(`Nomba webhook processing failed: ${message}`);
      });
  }
}
