import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const nombaCredentialsSchema = z.object({
  clientId: z.string().trim().min(1, 'clientId is required'),
  clientSecret: z.string().trim().min(1, 'clientSecret is required'),
  accountId: z.string().trim().min(1, 'accountId is required'),
});

export class NombaCredentialsDto extends createZodDto(nombaCredentialsSchema) {}

export type NombaCredentialsResponse = {
  connected: boolean;
};