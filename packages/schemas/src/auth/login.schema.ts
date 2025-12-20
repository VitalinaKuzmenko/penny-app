import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({
    message: 'errors.email.invalid',
  }),

  password: z.string().min(1, {
    message: 'errors.password.required',
  }),
});

export type LoginInput = z.infer<typeof loginSchema>;
