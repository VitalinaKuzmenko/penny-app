import z from 'zod';
import { CategorySchema } from './category.schema';

export const GetCategoriesResponseSchema = z.object({
  categories: z.array(CategorySchema),
});

export type GetCategoriesResponse = z.infer<typeof GetCategoriesResponseSchema>;
