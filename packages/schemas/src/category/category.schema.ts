import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  isDefault: z.boolean(),
});

export type Category = z.infer<typeof CategorySchema>;
