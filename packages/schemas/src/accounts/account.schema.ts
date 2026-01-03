import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const AccountListSchema = z.array(AccountSchema);

export type Account = z.infer<typeof AccountSchema>;
export type AccountList = z.infer<typeof AccountListSchema>;
