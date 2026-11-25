import { z } from 'zod';

import { CATEGORY_PALETTE } from '../settings/palettes';

import { CategoryIconSchema } from './category-icons';

export const CATEGORY_NAME_MAX_LENGTH = 50;

export const CategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  isDefault: z.boolean(),
  // the user's one transfer category: excluded from charts, can't be deleted
  isTransfer: z.boolean(),
  // soft-deleted transactions included
  transactionCount: z.number().int(),
});

export const CategoryNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(CATEGORY_NAME_MAX_LENGTH);

export const CreateCategorySchema = z.object({
  name: CategoryNameSchema,
  color: z.enum(CATEGORY_PALETTE),
  icon: CategoryIconSchema,
});

export const UpdateCategorySchema = CreateCategorySchema.partial().refine(
  (body) => Object.keys(body).length > 0,
  { message: 'Nothing to update' },
);

// Required by the server when the category still has transactions
export const DeleteCategoryQuerySchema = z.object({
  replacementCategoryId: z.string().uuid().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>;
export type DeleteCategoryQuery = z.infer<typeof DeleteCategoryQuerySchema>;
