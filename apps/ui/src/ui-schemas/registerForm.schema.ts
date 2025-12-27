import { z } from 'zod';
import { registerSchema } from 'schemas';

export const registerFormSchema = registerSchema
  .extend({
    confirmPassword: z.string().nonempty({
      message: 'errors.confirm_password.required',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'errors.passwords.do_not_match',
  });

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
