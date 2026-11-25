// Colours offered when creating or editing a category; includes every seeded category colour
export const CATEGORY_PALETTE = [
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#9E9E9E',
  '#607D8B',
] as const;

// Colours offered for tags; new tags created inline get the next one in turn
export const TAG_PALETTE = [
  '#1E88E5',
  '#43A047',
  '#FB8C00',
  '#8E24AA',
  '#E53935',
  '#00897B',
  '#6D4C41',
  '#D81B60',
  '#3949AB',
  '#7CB342',
] as const;

/**
 * The first palette colour nobody uses yet, or the next one in turn when all
 * are taken (so colours repeat evenly).
 */
export const nextPaletteColour = <T extends string>(
  palette: readonly T[],
  usedColours: (string | null)[],
): T => {
  const used = new Set(usedColours.map((c) => c?.toUpperCase()));
  return (
    palette.find((c) => !used.has(c.toUpperCase())) ??
    palette[usedColours.length % palette.length]
  );
};
