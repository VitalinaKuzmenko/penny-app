export const parseDate = (value: string): string | null => {
  if (!value) return null;

  // Try ISO first
  const iso = new Date(value);
  if (!isNaN(iso.getTime())) {
    return isoToDDMMYYYY(iso);
  }

  // Try DD/MM/YYYY or MM/DD/YYYY or YYYY-MM-DD with separators
  const parts = value.split(/[./-]/);
  if (parts.length !== 3) return null;

  const [a, b, c] = parts.map(Number);
  let date: Date;

  // Guess format: if first > 12 assume DD/MM/YYYY, else MM/DD/YYYY
  if (a > 12) {
    date = new Date(c, b - 1, a); // DD/MM/YYYY
  } else {
    date = new Date(c, a - 1, b); // MM/DD/YYYY
  }

  return isNaN(date.getTime()) ? null : isoToDDMMYYYY(date);
};

// Helper: convert Date to "dd/mm/yyyy"
const isoToDDMMYYYY = (date: Date) => {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};
