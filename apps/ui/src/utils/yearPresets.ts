import dayjs, { Dayjs } from 'dayjs';

export type YearPreset = number | 'ALL';

// Every year from the user's first transaction up to the current one, newest first.
// Transaction dates are whole UTC days, so the first year is read in UTC.
export const getPresetYears = (
  accounts: { firstTransactionDate: string | null }[],
  now = new Date(),
): number[] => {
  const currentYear = now.getFullYear();
  const firstYears = accounts
    .map((a) => a.firstTransactionDate)
    .filter((date): date is string => date !== null)
    .map((date) => new Date(date).getUTCFullYear());
  const firstYear = Math.min(currentYear, ...firstYears);

  return Array.from(
    { length: currentYear - firstYear + 1 },
    (_, i) => currentYear - i,
  );
};

export const yearRange = (year: number) => {
  const start = dayjs().year(year).startOf('year');
  return { startDate: start, endDate: start.endOf('year') };
};

// The preset matching a date range: a whole year, 'ALL' when there are no dates,
// or null for any other (custom) range
export const getSelectedPreset = (
  startDate: Dayjs | null,
  endDate: Dayjs | null,
): YearPreset | null => {
  if (!startDate && !endDate) return 'ALL';
  if (!startDate || !endDate) return null;

  const { startDate: yearStart, endDate: yearEnd } = yearRange(
    startDate.year(),
  );
  return startDate.isSame(yearStart, 'day') && endDate.isSame(yearEnd, 'day')
    ? startDate.year()
    : null;
};
