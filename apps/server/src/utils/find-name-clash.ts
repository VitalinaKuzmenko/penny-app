/**
 * The row whose name equals `name` ignoring case and surrounding spaces, other
 * than `exceptId`. Compared in code because Prisma's insensitive `equals` is
 * ILIKE on Postgres, where `%`, `_` and `\` in a name act as wildcards.
 */
export const findNameClash = <T extends { id: string; name: string }>(
  rows: T[],
  name: string,
  exceptId?: string,
): T | undefined => {
  const key = name.trim().toLowerCase();
  return rows.find(
    (row) => row.id !== exceptId && row.name.trim().toLowerCase() === key,
  );
};
