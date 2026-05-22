function buildRows(P, rTC_yr, rTH_tiers, n) {
  const r = rTC_yr / 12;
  const pmt = r === 0 ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
  const gopTH = P / n;
  const rows = [];
  let bTC = P, bTH = P, cum = 0;

  for (let i = 1; i <= n; i++) {
    const lTC = bTC * r;
    const gTC = pmt - lTC;
    const totTC = pmt;

    let rateYr = rTH_tiers[rTH_tiers.length - 1].rate;
    let limit = 0;
    for (let t = 0; t < rTH_tiers.length; t++) {
      limit += rTH_tiers[t].months;
      if (i <= limit) {
        rateYr = rTH_tiers[t].rate;
        break;
      }
    }

    const lTH = bTH * (rateYr / 12);
    const totTH = gopTH + lTH;

    const diff = totTC - totTH;
    cum += diff;

    rows.push({ i, bTC, gTC, lTC, totTC, rateYr, bTH, gopTH, lTH, totTH, diff, cum });
    bTC -= gTC;
    bTH -= gopTH;
  }
  applyDisplayRounding(rows, P, r);
  return { rows, pmt: Math.round(pmt), gopTH };
}

function applyDisplayRounding(rows, P, rTC_mo) {
  let paidGTH = 0, cum = 0;
  let bTC = Math.round(P);

  rows.forEach((r, idx) => {
    const last = idx === rows.length - 1;
    const totTC = Math.round(r.totTC);
    const totTH = Math.round(r.totTH);
    const lTCBase = Math.round(bTC * rTC_mo);
    const gTC = last ? bTC : totTC - lTCBase;
    const lTC = totTC - gTC;
    const nextBTC = last ? 0 : bTC - gTC;
    const gopTH = last ? Math.round(P - paidGTH) : Math.round(r.gopTH);
    const lTH = totTH - gopTH;
    const diff = totTC - totTH;
    cum += diff;

    r.d = {
      bTC,
      gTC,
      lTC,
      totTC,
      bTH: Math.round(r.bTH),
      gopTH,
      lTH,
      totTH,
      diff,
      cum
    };

    paidGTH += gopTH;
    bTC = nextBTC;
  });
}

export { buildRows, applyDisplayRounding };