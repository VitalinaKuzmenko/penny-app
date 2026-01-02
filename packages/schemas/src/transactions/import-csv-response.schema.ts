import z from 'zod';

export const ImportCsvResponseSchema = z.object({
  importId: z.string(),
});

export type ImportCsvResponse = z.infer<typeof ImportCsvResponseSchema>;
