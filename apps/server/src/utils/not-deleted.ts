// Soft-deleted transactions must not count anywhere except import dedupe
export const notDeleted = { deletedAt: null } as const;
