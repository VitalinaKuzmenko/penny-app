import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email({
    message: 'errors.email.invalid',
  }),

  password: z
    .string()
    .nonempty({ message: 'errors.password.required' })
    .min(8, { message: 'errors.password.min_length' }),

  userName: z.string().nonempty({ message: 'errors.username.required' }),
  userSurname: z.string().nonempty({ message: 'errors.user_surname.required' }),
});

export type RegisterInput = z.infer<typeof registerSchema>;
