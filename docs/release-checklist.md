# Release QA Checklist & Note Template

## 1. Automated QA

- [ ] Run `npm test`.
- [ ] Expected: `tests/calculator.test.js` and `tests/fees.test.js` pass, 22/22 tests.
- [ ] Run `npm run smoke`.
- [ ] Expected:
  - `index.html` opens with `file://`.
  - `compare.html` opens with `file://`.
  - `VPBank_TinChap_TheChap_Calculator.html` opens with `file://`.
  - No serious browser JS errors.
  - Chart canvas renders and is not blank.
  - TC summary changes after editing loan amount.
  - History save and clear work.
  - `index.html` links to `compare.html` by relative path.
  - `compare.html` links to `index.html` by relative path.
  - Offline share file is identical to `compare.html`.

> `npm run smoke` uses local Chrome/Edge through Chrome DevTools Protocol. If Chrome is not installed in a standard path, set `CHROME_PATH`.

## 2. Manual QA - `index.html` TC Only

- [ ] Open `/` on GitHub Pages or double-click `index.html`.
- [ ] Change loan amount, TC rate, and terms 12 / 36 / 84.
- [ ] Check summary, chart, monthly table, and 7-term TC comparison.
- [ ] Save a history item, load it, delete one item, then use "Xóa tất cả".
- [ ] Confirm privacy disclaimer says history stays on device, is not sent to server, and auto-deletes after 30 days.
- [ ] Check Copy Summary, Share Card, and Export PDF.
- [ ] Click the link to `compare.html`.

## 3. Manual QA - `compare.html` TC vs TH

- [ ] Open `/compare.html` directly.
- [ ] Change TC rate, TH Y1/Y2/Y3+, loan amount, and term.
- [ ] Enter annual insurance fee `5.000.000` and verify:
  - 12T = 5 million.
  - 36T = 15 million.
  - 84T = 35 million.
- [ ] Check summary, chart, monthly table, and 7-term comparison.
- [ ] Test prepayment with `M=1` and `M=KH-1`.
- [ ] Save/load/delete history, Copy Summary, Share Card, and Export PDF.
- [ ] Click the link back to `index.html`.

## 4. Deploy QA - GitHub Pages

- [ ] Root URL opens `index.html`: `https://cuongmeocoder.github.io/vpbank-mso-tool/`
- [ ] Child URL opens `compare.html`: `https://cuongmeocoder.github.io/vpbank-mso-tool/compare.html`
- [ ] Use cache-busting query after push if needed:
  - `/?v=<commit>`
  - `/compare.html?v=<commit>`
- [ ] Version/footer text matches the release.
- [ ] Privacy text is present on both pages.
- [ ] `compare.html` contains annual insurance fee logic: `feeBaoHiem * Math.ceil(KH / 12)`.
- [ ] `src/`, `tests/`, and `package.json` are not imported by deployed HTML.
- [ ] `VPBank_TinChap_TheChap_Calculator.html` is synced with `compare.html`.

## 5. Release Note Template

```markdown
**Version:** vX.Y
**Date:** YYYY-MM-DD
**Commit:** <short-hash>

**Changed:**
- ...

**Tested:**
- npm test
- npm run smoke
- Manual QA: index.html
- Manual QA: compare.html
- GitHub Pages deploy check

**Known Limits:**
- ...

**Rollback File:**
- ...
```
