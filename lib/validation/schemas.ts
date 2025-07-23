// lib/validation/schemas.ts
import { z } from 'zod';

export const walletSchema = z.object({
  address: z.string()
    .refine(
      (val) => /^0x[a-fA-F0-9]{40}$/.test(val) || /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.eth$/.test(val),
      'Invalid Ethereum address or ENS name'
    )
    .transform((val) => val.toLowerCase()),
});

export class ValidationService {
  static validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    try {
      return schema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation error: ${error.errors[0].message}`);
      }
      throw error;
    }
  }
}