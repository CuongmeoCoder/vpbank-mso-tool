import { describe, it, expect } from 'vitest';
import { TC_PRESETS, getPresetByRate, CUSTOM_NOTE } from '../src/presets.js';

describe('Presets Data Helper', () => {
  it('1. Đảm bảo danh sách preset không rỗng', () => {
    expect(TC_PRESETS.length).toBeGreaterThan(0);
  });

  it('2. getPresetByRate trả về đúng kịch bản hoặc null nếu không khớp', () => {
    expect(getPresetByRate(19).id).toBe('ref_19');
    expect(getPresetByRate(99.9)).toBeNull();
  });

  it('3. Không chứa các từ bị cấm trong label', () => {
    const forbiddenWords = ['ưu đãi', 'chuẩn', 'gói', 'chính sách', 'cam kết', 'vpbank'];
    TC_PRESETS.forEach(preset => {
      const lowerLabel = preset.label.toLowerCase();
      forbiddenWords.forEach(word => {
        expect(lowerLabel).not.toContain(word);
      });
    });
  });

  it('4. Mỗi preset phải có note hợp lệ và note.length <= 120', () => {
    TC_PRESETS.forEach(preset => {
      expect(preset.note).toBeDefined();
      expect(typeof preset.note).toBe('string');
      expect(preset.note.length).toBeGreaterThan(0);
      expect(preset.note.length).toBeLessThanOrEqual(120);
    });
  });

  it('5. CUSTOM_NOTE phải tồn tại', () => {
    expect(CUSTOM_NOTE).toBeDefined();
    expect(typeof CUSTOM_NOTE).toBe('string');
    expect(CUSTOM_NOTE.length).toBeGreaterThan(0);
  });

  it('6. CUSTOM_NOTE.length <= 80', () => {
    expect(CUSTOM_NOTE.length).toBeLessThanOrEqual(80);
  });
});