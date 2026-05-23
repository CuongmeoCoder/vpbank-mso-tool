export const CUSTOM_NOTE = "Đang dùng lãi suất tùy chỉnh của MSO.";

const presetNote = "Dùng để minh hoạ kịch bản trả nợ. MSO xác nhận lãi suất thực tế trước khi gặp khách.";

export const TC_PRESETS = [
  { id: 'ref_15', rate: 15, label: 'Tham khảo 15%', note: presetNote },
  { id: 'ref_19', rate: 19, label: 'Tham khảo 19%', note: presetNote },
  { id: 'ref_21', rate: 21, label: 'Tham khảo 21%', note: presetNote }
];

export function getPresetByRate(rate) {
  return TC_PRESETS.find(p => p.rate === rate) || null;
}