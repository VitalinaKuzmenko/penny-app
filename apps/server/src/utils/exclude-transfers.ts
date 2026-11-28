// Moving money between your own accounts is neither income nor spend.
// Uses OR, so combine it under AND with any other OR filter.
export const excludeInternalTransfers = {
  OR: [{ category: null }, { category: { isTransfer: false } }],
};
