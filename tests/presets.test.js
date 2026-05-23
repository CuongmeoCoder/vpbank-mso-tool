import { describe, it, expect } from 'vitest';
import { TC_PRESETS, getPresetByRate } from '../src/presets.js';

describe('Presets Data Helper', () => {
  it('1. Đảm bảo danh sách preset không rỗng', () => {
    expect(TC_PRESETS.length).toBeGreaterThan(0);
  });

  it('2. getPresetByRate trả về đúng kịch bản hoặc null nếu không khớp', () => {
    expect(getPresetByRate(19).id).toBe('ref_19');
    expect(getPresetByRate(99.9)).toBeNull();
  });
});