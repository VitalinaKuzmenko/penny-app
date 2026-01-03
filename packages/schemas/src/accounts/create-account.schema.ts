import { z } from 'zod';

export const CreateAccountSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(50, 'Account name is too long'),
});

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
