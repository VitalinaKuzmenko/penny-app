import { boolean, z } from 'zod';

export const ConfirmImportResponseSchema = z.object({
  success: boolean(),
});

export type ConfirmImportResponse = z.infer<typeof ConfirmImportResponseSchema>;
