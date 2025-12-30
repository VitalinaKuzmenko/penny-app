export const parseDate = (value: string): Date | null => {
  if (!value) return null;

  // ISO
  const iso = new Date(value);
  if (!isNaN(iso.getTime())) return iso;

  // DD/MM/YYYY or MM/DD/YYYY
  const parts = value.split(/[./-]/);
  if (parts.length !== 3) return null;

  const [a, b, c] = parts.map(Number);

  // Guess format
  const date =
    a > 12
      ? new Date(c, b - 1, a) // DD/MM/YYYY
      : new Date(c, a - 1, b); // MM/DD/YYYY

  return isNaN(date.getTime()) ? null : date;
};
