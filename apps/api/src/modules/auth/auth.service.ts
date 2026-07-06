import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { ApiErrorCode } from '../../common/errors/api-error-code';
import { ApiException } from '../../common/errors/api.exception';
import { loadEnv } from '../../config/env';
import type {
  MerchantAuthResponse,
  RefreshTokenResponse,
} from './dto/auth.dto';
import type { JwtSignOptions } from '@nestjs/jwt';
import type { MerchantJwtPayload } from './types/jwt-payload';

const BCRYPT_COST = 12;

@Injectable()
export class AuthService {
  private readonly env = loadEnv();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    businessName: string,
    email: string,
    password: string,
  ): Promise<MerchantAuthResponse> {
    const normalizedEmail = email.toLowerCase();
    const existing = await this.prisma.merchant.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ApiException(
        ApiErrorCode.VALIDATION_ERROR,
        'An account with this email already exists.',
        HttpStatus.CONFLICT,
      );
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_COST);
    const merchant = await this.prisma.merchant.create({
      data: {
        businessName,
        email: normalizedEmail,
        passwordHash,
      },
    });

    return this.buildAuthResponse(merchant);
  }

  async login(email: string, password: string): Promise<MerchantAuthResponse> {
    const normalizedEmail = email.toLowerCase();
    const merchant = await this.prisma.merchant.findUnique({
      where: { email: normalizedEmail },
    });

    if (!merchant) {
      throw new ApiException(
        ApiErrorCode.UNAUTHORIZED,
        'Invalid email or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordMatches = await bcrypt.compare(password, merchant.passwordHash);
    if (!passwordMatches) {
      throw new ApiException(
        ApiErrorCode.UNAUTHORIZED,
        'Invalid email or password.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.buildAuthResponse(merchant);
  }

  async refresh(refreshToken: string): Promise<RefreshTokenResponse> {
    let payload: MerchantJwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<MerchantJwtPayload>(refreshToken, {
        secret: this.env.JWT_SECRET,
      });
    } catch {
      throw new ApiException(
        ApiErrorCode.UNAUTHORIZED,
        'Invalid or expired refresh token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (payload.type !== 'refresh') {
      throw new ApiException(
        ApiErrorCode.UNAUTHORIZED,
        'Invalid or expired refresh token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const merchant = await this.prisma.merchant.findUnique({
      where: { id: payload.sub },
    });

    if (!merchant) {
      throw new ApiException(
        ApiErrorCode.UNAUTHORIZED,
        'Invalid or expired refresh token.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      accessToken: await this.signAccessToken(merchant.id, merchant.email),
    };
  }

  private async buildAuthResponse(merchant: {
    id: string;
    businessName: string;
    email: string;
    createdAt: Date;
  }): Promise<MerchantAuthResponse> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signAccessToken(merchant.id, merchant.email),
      this.signRefreshToken(merchant.id, merchant.email),
    ]);

    return {
      merchant: {
        id: merchant.id,
        businessName: merchant.businessName,
        email: merchant.email,
        createdAt: merchant.createdAt.toISOString(),
      },
      accessToken,
      refreshToken,
    };
  }

  private signAccessToken(merchantId: string, email: string): Promise<string> {
    const payload: MerchantJwtPayload = {
      sub: merchantId,
      email,
      type: 'access',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.env.JWT_SECRET,
      expiresIn: this.env.JWT_ACCESS_TOKEN_EXPIRY as JwtSignOptions['expiresIn'],
    });
  }

  private signRefreshToken(merchantId: string, email: string): Promise<string> {
    const payload: MerchantJwtPayload = {
      sub: merchantId,
      email,
      type: 'refresh',
    };

    return this.jwtService.signAsync(payload, {
      secret: this.env.JWT_SECRET,
      expiresIn: this.env.JWT_REFRESH_TOKEN_EXPIRY as JwtSignOptions['expiresIn'],
    });
  }
}
