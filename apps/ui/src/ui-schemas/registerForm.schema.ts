import { z } from 'zod';
import { RegisterSchema } from 'schemas';

export const registerFormSchema = RegisterSchema.extend({
  confirmPassword: z.string().nonempty({
    message: 'errors.confirm_password.required',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'errors.passwords.do_not_match',
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;
