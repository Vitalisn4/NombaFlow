import { Body, Controller, Headers, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import type { NombaWebhookPayload } from './types/nomba-webhook.types';
import { WebhooksService } from './webhooks.service';

@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Post('nomba')
  async handleNombaWebhook(
    @Headers('nomba-signature') signature: string | undefined,
    @Headers('nomba-timestamp') timestamp: string | undefined,
    @Body() payload: NombaWebhookPayload,
    @Res() res: Response,
  ): Promise<void> {
    res.status(200).send();

    await this.webhooksService.acceptWebhook(payload, signature, timestamp);
  }
}
