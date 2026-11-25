import { z } from 'zod';

export const ACCOUNT_NAME_MAX_LENGTH = 50;

export const AccountNameSchema = z
  .string()
  .trim()
  .min(1, 'Account name is required')
  .max(ACCOUNT_NAME_MAX_LENGTH, 'Account name is too long');

export const CreateAccountSchema = z.object({
  name: AccountNameSchema,
});

export const UpdateAccountSchema = CreateAccountSchema;

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;
