import { parseDate } from './parse-date';

const ymd = (d: Date | null) =>
  d ? [d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()] : null;

describe('parseDate', () => {
  it('returns null for empty input', () => {
    expect(parseDate('')).toBeNull();
  });

  it('parses ISO dates', () => {
    expect(ymd(parseDate('2025-01-15'))).toEqual([2025, 1, 15]);
  });

  it('anchors date-only values to UTC midnight regardless of server timezone', () => {
    expect(parseDate('2025-01-15')?.toISOString()).toBe(
      '2025-01-15T00:00:00.000Z',
    );
    expect(parseDate('07/03/2025')?.toISOString()).toBe(
      '2025-03-07T00:00:00.000Z',
    );
    expect(parseDate('15 Jan 2025')?.toISOString()).toBe(
      '2025-01-15T00:00:00.000Z',
    );
  });

  it('parses YYYY/MM/DD', () => {
    expect(ymd(parseDate('2025/03/07'))).toEqual([2025, 3, 7]);
  });

  it('treats slash-separated dates as DD/MM/YYYY (UK bank exports)', () => {
    expect(ymd(parseDate('07/03/2025'))).toEqual([2025, 3, 7]);
    expect(ymd(parseDate('25/12/2025'))).toEqual([2025, 12, 25]);
  });

  it('does not let the native US parser swap day and month when both are <= 12', () => {
    // Regression: rows from penny_template.csv were stored as 1 March instead of 3 January
    expect(ymd(parseDate('03/01/2025'))).toEqual([2025, 1, 3]);
    expect(ymd(parseDate('01/03/2025'))).toEqual([2025, 3, 1]);
    // fully ambiguous — native parser says 11 Dec, UK convention says 12 Nov
    expect(ymd(parseDate('12/11/2025'))).toEqual([2025, 11, 12]);
  });

  it('still accepts full ISO timestamps via the native parser', () => {
    const d = parseDate('2025-01-15T10:30:00Z');
    expect(d?.toISOString()).toBe('2025-01-15T10:30:00.000Z');
  });

  it('parses DD.MM.YYYY', () => {
    expect(ymd(parseDate('25.12.2025'))).toEqual([2025, 12, 25]);
  });

  it('disambiguates DD-MM-YYYY when the first part cannot be a month', () => {
    expect(ymd(parseDate('25-01-2025'))).toEqual([2025, 1, 25]);
  });

  it('disambiguates MM-DD-YYYY when the second part cannot be a month', () => {
    expect(ymd(parseDate('01-25-2025'))).toEqual([2025, 1, 25]);
  });

  it('defaults ambiguous dash dates to DD-MM-YYYY', () => {
    expect(ymd(parseDate('03-04-2025'))).toEqual([2025, 4, 3]);
  });

  it('rejects impossible calendar dates instead of rolling over', () => {
    expect(parseDate('31/02/2025')).toBeNull();
    expect(parseDate('30.02.2025')).toBeNull();
  });

  it('rejects non-numeric parts', () => {
    expect(parseDate('aa/bb/cccc')).toBeNull();
  });

  it('rejects strings without a recognised separator', () => {
    expect(parseDate('not a date')).toBeNull();
  });
});
