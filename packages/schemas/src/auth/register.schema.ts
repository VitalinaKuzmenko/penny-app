import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({
    message: 'errors.email.invalid',
  }),

  password: z.string().min(8, {
    message: 'errors.password.required',
  }),

  userName: z.string().min(1).optional(),

  userSurname: z.string().min(1).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
