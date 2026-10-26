import { z } from 'zod';

export const AccountSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const AccountListSchema = z.array(AccountSchema);

export const AccountWithActivitySchema = AccountSchema.extend({
  // Newest transaction date on the account (how far the data goes)
  lastTransactionDate: z.string().datetime().nullable(),
  // When transactions were last saved to the account
  lastImportedAt: z.string().datetime().nullable(),
});

export type Account = z.infer<typeof AccountSchema>;
export type AccountList = z.infer<typeof AccountListSchema>;
export type AccountWithActivity = z.infer<typeof AccountWithActivitySchema>;
