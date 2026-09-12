import { buildTransactionFingerprint } from './transaction-fingerprint';

describe('buildTransactionFingerprint', () => {
  const date = new Date('2026-08-03T00:00:00Z');

  it('is deterministic for identical input', () => {
    const a = buildTransactionFingerprint(date, -34.2, 'TESCO STORES 3201');
    const b = buildTransactionFingerprint(date, -34.2, 'TESCO STORES 3201');
    expect(a).toBe(b);
    expect(a).toMatch(/^[a-f0-9]{64}$/);
  });

  it('ignores description casing and surrounding whitespace', () => {
    const a = buildTransactionFingerprint(date, -34.2, 'TESCO STORES 3201');
    const b = buildTransactionFingerprint(date, -34.2, '  tesco stores 3201 ');
    expect(a).toBe(b);
  });

  it('ignores the sign of the amount', () => {
    const expense = buildTransactionFingerprint(date, -34.2, 'TESCO');
    const income = buildTransactionFingerprint(date, 34.2, 'TESCO');
    expect(expense).toBe(income);
  });

  it('normalises amount precision to two decimals', () => {
    const a = buildTransactionFingerprint(date, 34.2, 'TESCO');
    const b = buildTransactionFingerprint(date, 34.2000001, 'TESCO');
    expect(a).toBe(b);
  });

  it('changes when the date changes', () => {
    const other = new Date('2026-08-04T00:00:00Z');
    expect(buildTransactionFingerprint(date, 34.2, 'TESCO')).not.toBe(
      buildTransactionFingerprint(other, 34.2, 'TESCO'),
    );
  });

  it('changes when the amount changes', () => {
    expect(buildTransactionFingerprint(date, 34.2, 'TESCO')).not.toBe(
      buildTransactionFingerprint(date, 34.21, 'TESCO'),
    );
  });

  it('changes when the description changes', () => {
    expect(buildTransactionFingerprint(date, 34.2, 'TESCO STORES')).not.toBe(
      buildTransactionFingerprint(date, 34.2, 'TESCO MOBILE'),
    );
  });

  it('uses the UTC calendar day, not the time of day', () => {
    const morning = new Date('2026-08-03T08:00:00Z');
    const evening = new Date('2026-08-03T22:30:00Z');
    expect(buildTransactionFingerprint(morning, 1, 'X')).toBe(
      buildTransactionFingerprint(evening, 1, 'X'),
    );
  });
});
