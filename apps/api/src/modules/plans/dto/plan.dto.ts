import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const amountSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'amount must be a valid decimal string')
  .refine((value) => Number(value) > 0, 'amount must be greater than zero');

export const billingIntervalSchema = z.enum([
  'WEEKLY',
  'MONTHLY',
  'QUARTERLY',
  'ANNUALLY',
]);

export const planTypeSchema = z.enum(['STANDARD', 'AJO']);

export const createPlanSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  description: z.string().trim().optional(),
  amount: amountSchema,
  currency: z.string().trim().length(3).default('NGN'),
  interval: billingIntervalSchema,
  intervalCount: z.number().int().positive().default(1),
  maxCycles: z.number().int().positive().nullable().optional(),
  planType: planTypeSchema.default('STANDARD'),
  trialDays: z.number().int().min(0).default(0),
});

export class CreatePlanDto extends createZodDto(createPlanSchema) {}

export const updatePlanSchema = z
  .object({
    name: z.string().trim().min(1, 'name is required').optional(),
    description: z.string().trim().nullable().optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: 'At least one of name or description must be provided',
  });

export class UpdatePlanDto extends createZodDto(updatePlanSchema) {}
