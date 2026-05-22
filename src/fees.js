export function computeFeesForTerm(feeThamDinh, feeCongChung, feeBaoHiemNam, feeKhac, n) {
  return feeThamDinh + feeCongChung + feeBaoHiemNam * Math.ceil(n / 12) + feeKhac;
}