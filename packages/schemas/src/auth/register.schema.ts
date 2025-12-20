import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),

  password: z.string().min(8, 'Password must be at least 8 characters'),

  userName: z.string().min(1).optional(),

  userSurname: z.string().min(1).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
