import { boolean, z } from 'zod';

export const ConfirmImportResponseSchema = z.object({
  success: boolean(),
  skippedDuplicates: z.number().int().nonnegative().default(0),
});

export type ConfirmImportResponse = z.infer<typeof ConfirmImportResponseSchema>;
