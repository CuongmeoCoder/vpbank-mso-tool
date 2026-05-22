import { describe, it, expect } from 'vitest';
import { computeFeesForTerm } from '../src/fees.js';

describe('computeFeesForTerm', () => {
  it('Phí one-time không đổi theo kỳ hạn', () => {
    const result12 = computeFeesForTerm(1_000_000, 500_000, 0, 200_000, 12);
    const result84 = computeFeesForTerm(1_000_000, 500_000, 0, 200_000, 84);
    expect(result12).toBe(1_700_000);
    expect(result84).toBe(1_700_000);
  });

  it('Bảo hiểm 12T = 1 năm', () => {
    const fee = computeFeesForTerm(0, 0, 5_000_000, 0, 12);
    expect(fee).toBe(5_000_000);
  });

  it('Bảo hiểm 13T = 2 năm (Math.ceil)', () => {
    const fee = computeFeesForTerm(0, 0, 5_000_000, 0, 13);
    expect(fee).toBe(10_000_000);
  });

  it('Bảo hiểm 36T = 3 năm', () => {
    const fee = computeFeesForTerm(0, 0, 5_000_000, 0, 36);
    expect(fee).toBe(15_000_000);
  });

  it('Bảo hiểm 84T = 7 năm', () => {
    const fee = computeFeesForTerm(0, 0, 5_000_000, 0, 84);
    expect(fee).toBe(35_000_000);
  });

  it('Tất cả phí = 0', () => {
    expect(computeFeesForTerm(0, 0, 0, 0, 36)).toBe(0);
  });

  it('Tổng hợp đầy đủ: 36T', () => {
    // thamDinh=2tr, congChung=1tr, baoHiem=5tr/năm × 3 = 15tr, khac=500k → 18.5tr
    const fee = computeFeesForTerm(2_000_000, 1_000_000, 5_000_000, 500_000, 36);
    expect(fee).toBe(18_500_000);
  });
});
