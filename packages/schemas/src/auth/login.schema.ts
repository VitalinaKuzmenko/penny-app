import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: 'errors.email.invalid' }),
  password: z
    .string()
    .nonempty({ message: 'errors.password.required' })
    .min(8, { message: 'errors.password.min_length' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
