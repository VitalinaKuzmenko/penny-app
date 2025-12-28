import z from 'zod';

export const authResponseSchema = z.object({
  success: z.boolean(),
});

export type AuthResponse = z.infer<typeof authResponseSchema>;
