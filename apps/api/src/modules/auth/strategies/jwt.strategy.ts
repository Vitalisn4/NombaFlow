import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { loadEnv } from '../../../config/env';
import type { AuthenticatedMerchant, MerchantJwtPayload } from '../types/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const env = loadEnv();
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: env.JWT_SECRET,
    });
  }

  validate(payload: MerchantJwtPayload): AuthenticatedMerchant {
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid access token');
    }

    return {
      merchantId: payload.sub,
      email: payload.email,
    };
  }
}
