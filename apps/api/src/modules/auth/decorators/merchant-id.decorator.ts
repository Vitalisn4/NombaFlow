import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthenticatedMerchant } from '../types/jwt-payload';

export const MerchantId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthenticatedMerchant }>();
    return request.user.merchantId;
  },
);
