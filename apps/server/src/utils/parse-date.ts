export const parseDate = (value: string): Date | null => {
  if (!value) return null;

  // Numeric D/M/Y-shaped strings must NOT go through the native parser:
  // V8 reads "07/03/2025" as US July 3, but UK bank exports mean 7 March.
  const isNumericTriple = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}$/.test(
    value.trim(),
  );

  if (!isNumericTriple) {
    // Anything else (ISO timestamps, "15 Jan 2025", …) — let the runtime try
    const native = new Date(value);
    return isNaN(native.getTime()) ? null : native;
  }

  // Detect separator
  const match = value.match(/[-/.]/);
  if (!match) return null;

  const sep = match[0];
  const parts = value.split(sep);
  if (parts.length !== 3) return null;

  const [p1, p2, p3] = parts;
  const [a, b, c] = [Number(p1), Number(p2), Number(p3)];
  if ([a, b, c].some((n) => Number.isNaN(n))) return null;

  let year: number;
  let month: number;
  let day: number;

  // Case 1: YYYY-MM-DD or YYYY/MM/DD or YYYY.MM.DD
  if (p1.length === 4) {
    year = a;
    month = b;
    day = c;
  } else if (sep === '/') {
    // Case 2: assume DD/MM/YYYY for slashes (common EU style)
    day = a;
    month = b;
    year = c;
  } else {
    // Case 3: with '-' or '.' (DD-MM-YYYY vs MM-DD-YYYY)

    if (a > 31 || b > 31) return null; // invalid anyway

    if (a > 12 && b <= 12) {
      // unambiguously DD-MM-YYYY (day > 12)
      day = a;
      month = b;
      year = c;
    } else if (b > 12 && a <= 12) {
      // unambiguously MM-DD-YYYY (day > 12 in second position)
      month = a;
      day = b;
      year = c;
    } else {
      // ambiguous: both a and b <= 12
      // Choose a sensible default based on your use case.
      // If your world is mostly DD-MM-YYYY, do this:
      day = a; // treat first as day
      month = b; // second as month
      year = c;

      // OR, if you want to be strict, you could instead:
      // return null; // and force user to fix ambiguous dates
    }
  }

  // JS months are 0-based
  const date = new Date(year, month - 1, day);

  // Validate that JS didn't roll over (e.g., 31/02 -> 02/03)
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
};
