import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const registerSchema = z.object({
  businessName: z.string().trim().min(1, 'businessName is required'),
  email: z.string().trim().email('email must be a valid email address'),
  password: z.string().min(8, 'password must be at least 8 characters'),
});

export class RegisterDto extends createZodDto(registerSchema) {}

export const loginSchema = z.object({
  email: z.string().trim().email('email must be a valid email address'),
  password: z.string().min(1, 'password is required'),
});

export class LoginDto extends createZodDto(loginSchema) {}

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'refreshToken is required'),
});

export class RefreshDto extends createZodDto(refreshSchema) {}

export type MerchantAuthResponse = {
  merchant: {
    id: string;
    businessName: string;
    email: string;
    createdAt: string;
  };
  accessToken: string;
  refreshToken: string;
};

export type RefreshTokenResponse = {
  accessToken: string;
};
