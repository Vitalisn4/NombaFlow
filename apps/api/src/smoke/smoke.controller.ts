import { Body, Controller, Post } from '@nestjs/common';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const smokeBodySchema = z.object({
  message: z.string().min(1, 'message is required'),
});

class SmokeBodyDto extends createZodDto(smokeBodySchema) {}

@Controller('smoke')
export class SmokeController {
  @Post('validate')
  validate(@Body() body: SmokeBodyDto) {
    return { ok: true, echo: body.message };
  }
}
