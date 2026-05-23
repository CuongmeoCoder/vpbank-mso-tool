export const TC_PRESETS = [
  { id: 'ref_15', rate: 15, label: 'Tham khảo 15%' },
  { id: 'ref_19', rate: 19, label: 'Tham khảo 19%' },
  { id: 'ref_21', rate: 21, label: 'Tham khảo 21%' }
];

export function getPresetByRate(rate) {
  return TC_PRESETS.find(p => p.rate === rate) || null;
}