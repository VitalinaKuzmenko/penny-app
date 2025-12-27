import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const authResponseSchema = z.object({
  success: z.boolean(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;

export class AuthResponseDto extends createZodDto(authResponseSchema) {}
