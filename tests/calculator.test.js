import { describe, it, expect } from 'vitest';
import { buildRows } from '../src/calculator.js';

const TIERS_3Y = [
  { months: 12, rate: 0.075 },
  { months: 12, rate: 0.115 },
  { months: Infinity, rate: 0.125 }
];

describe('Regression — mẫu chuẩn 1 tỷ / 36T', () => {
  const P = 1_000_000_000;

  it('TC monthly = 36.656.020', () => {
    const { pmt } = buildRows(P, 0.19, TIERS_3Y, 36);
    expect(pmt).toBe(36_656_020);
  });

  it('TH T1 = 34.027.778, TH T13 = 34.166.667', () => {
    const { rows } = buildRows(P, 0.19, TIERS_3Y, 36);
    expect(rows[0].d.totTH).toBe(34_027_778);
    expect(rows[12].d.totTH).toBe(34_166_667);
  });

  it('Tổng TC = 1.319.616.720', () => {
    const { rows } = buildRows(P, 0.19, TIERS_3Y, 36);
    const totTC = rows.reduce((s, r) => s + r.d.totTC, 0);
    expect(totTC).toBe(1_319_616_720);
  });

  it('Tổng TH = 1.145.208.334', () => {
    const { rows } = buildRows(P, 0.19, TIERS_3Y, 36);
    const totTH = rows.reduce((s, r) => s + r.d.totTH, 0);
    expect(totTH).toBe(1_145_208_334);
  });
});

describe('Invariants', () => {
  it('Gốc + Lãi = Tổng mọi dòng (TC & TH)', () => {
    const { rows } = buildRows(1_000_000_000, 0.19, TIERS_3Y, 36);
    rows.forEach(r => {
      expect(r.d.gTC + r.d.lTC).toBe(r.d.totTC);
      expect(r.d.gopTH + r.d.lTH).toBe(r.d.totTH);
    });
  });

  it('Tổng Gốc TC = P', () => {
    const P = 500_000_000;
    const { rows } = buildRows(P, 0.15, TIERS_3Y, 48);
    expect(rows.reduce((s, r) => s + r.d.gTC, 0)).toBe(P);
  });

  it('Tổng Gốc TH = P', () => {
    const P = 500_000_000;
    const { rows } = buildRows(P, 0.15, TIERS_3Y, 48);
    expect(rows.reduce((s, r) => s + r.d.gopTH, 0)).toBe(P);
  });

  it('Sau khi trả kỳ cuối, dư nợ về 0 (bTC - gTC = 0)', () => {
    const { rows } = buildRows(200_000_000, 0.19, TIERS_3Y, 24);
    const last = rows[rows.length - 1];
    // d.bTC = dư nợ đầu kỳ; last gTC = bTC → bTC - gTC = 0
    expect(last.d.bTC - last.d.gTC).toBe(0);
  });
});

describe('Tier boundary', () => {
  it('T12 dùng Y1 (7.5%), T13 dùng Y2 (11.5%)', () => {
    const { rows } = buildRows(1_000_000_000, 0.19, TIERS_3Y, 36);
    expect(rows[11].rateYr).toBe(0.075);
    expect(rows[12].rateYr).toBe(0.115);
  });

  it('T24 dùng Y2 (11.5%), T25 dùng Y3+ (12.5%)', () => {
    const { rows } = buildRows(1_000_000_000, 0.19, TIERS_3Y, 36);
    expect(rows[23].rateYr).toBe(0.115);
    expect(rows[24].rateYr).toBe(0.125);
  });
});

describe('Edge cases', () => {
  it('rTC = 0%: pmt = P/n, lãi = 0', () => {
    const { pmt, rows } = buildRows(360_000_000, 0, TIERS_3Y, 36);
    expect(pmt).toBe(10_000_000);
    expect(rows[0].d.lTC).toBe(0);
    expect(rows.reduce((s, r) => s + r.d.gTC, 0)).toBe(360_000_000);
  });

  it('KH = 12: chỉ có 12 rows, không có T13', () => {
    const { rows } = buildRows(1_000_000_000, 0.19, TIERS_3Y, 12);
    expect(rows.length).toBe(12);
    expect(rows[12]).toBeUndefined();
    expect(rows[11].rateYr).toBe(0.075);
  });

  it('P nhỏ (10 triệu): rounding không vỡ invariant', () => {
    const P = 10_000_000;
    const { rows } = buildRows(P, 0.19, TIERS_3Y, 36);
    expect(rows.reduce((s, r) => s + r.d.gTC, 0)).toBe(P);
    expect(rows.reduce((s, r) => s + r.d.gopTH, 0)).toBe(P);
    rows.forEach(r => {
      expect(r.d.gTC + r.d.lTC).toBe(r.d.totTC);
      expect(r.d.gopTH + r.d.lTH).toBe(r.d.totTH);
    });
  });
});

describe('Prepayment remaining balance', () => {
  const P = 1_000_000_000;

  it('prepayM = 1: bTC sau tháng 1 = P - gốc T1', () => {
    const { rows } = buildRows(P, 0.19, TIERS_3Y, 36);
    const expectedRemain = P - rows[0].d.gTC;
    expect(rows[1].d.bTC).toBe(expectedRemain);
  });

  it('prepayM = KH-1: bTC sau tháng 35 = gốc cuối', () => {
    const { rows } = buildRows(P, 0.19, TIERS_3Y, 36);
    // rows[35] = tháng 36 (cuối). Trước khi trả kỳ 36, dư nợ = rows[35].d.bTC
    const remain = rows[35].d.bTC;
    expect(remain).toBeGreaterThan(0);
    // Sau khi trả kỳ 36, dư nợ = 0
    expect(rows[35].d.bTC - rows[35].d.gTC).toBe(0);
  });
});
