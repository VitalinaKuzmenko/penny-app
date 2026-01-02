import z from 'zod';

export const AuthResponseSchema = z.object({
  success: z.boolean(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
