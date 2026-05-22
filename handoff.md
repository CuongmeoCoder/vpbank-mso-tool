# 📋 HANDOFF — VPBank MSO Tool: Tín Chấp vs Thế Chấp
> **Phiên bản:** v1.7 · **Ngày cập nhật:** 22/05/2026 · **Tác giả:** MSO NienKim × Claude AI

---

## 1. Mục tiêu Tool

Tool được xây dựng cho **MSO (Market Sales Officer) VPBank** nhằm:

- Trực quan hoá và so sánh dòng tiền **Tín Chấp (Niên Kim cố định)** vs **Thế Chấp (Dư nợ giảm dần + Lãi thả nổi)**
- Tự động tính toán khi nhập thông số — không cần Excel, không cần cài đặt
- Dùng được trên **laptop, điện thoại, máy tính bảng** qua bất kỳ trình duyệt nào
- **Hoạt động 100% offline** (v1.1 trở đi — Chart.js nhúng inline)
- Hỗ trợ MSO **lập luận chốt khách hàng** với số liệu thực tế
- **Cá nhân hoá theo tên KH + MSO** và **xuất PDF / Copy summary** cho khách (v1.1)
- **Tối ưu điện thoại** theo hướng khách nhìn thấy kết luận và lợi ích tín chấp trước (v1.2)

---

## 2. File deliverable

### Trang deploy (GitHub Pages)

| URL / File | Mô tả |
|-----------|-------|
| `/` → `index.html` | **Trang chủ — Tín Chấp only** (v1.7): nhập số tiền, lãi suất, xem bảng + chart + so sánh 7 kỳ hạn TC. Không có TH. |
| `/compare.html` | **Trang so sánh đầy đủ** (v1.7): TC vs TH side-by-side, phí phụ TH, bảng 7 kỳ hạn song song. |
| `VPBank_TinChap_TheChap_Calculator.html` | Bản offline share — gửi qua Zalo/email, mở bằng Chrome/Edge/Safari/mobile browser. Nội dung đồng bộ với `compare.html`. |
| `VPBank_TinChap_TheChap_Calculator_v1.0_backup.html` | Bản v1.0 gốc — rollback nếu cần |
| `Bang_Tinh_TC_NienKim_Vs_TH_GiamDan_ThaNoi.xlsx` | File Excel gốc (nguồn tham khảo cấu trúc) |
| `handoff.md` | Tài liệu này |

### Module tính toán + Test

| File | Mô tả |
|------|-------|
| `src/calculator.js` | `buildRows()` + `applyDisplayRounding()` — core calc, named ES module exports |
| `src/fees.js` | `computeFeesForTerm()` — tính tổng phí phụ TH theo kỳ hạn |
| `tests/calculator.test.js` | 15 test cases: regression, invariants, tier boundary, edge cases, prepay |
| `tests/fees.test.js` | 7 test cases: feeBaoHiem × năm, tổ hợp đầy đủ |
| `package.json` | `"type": "module"` + vitest |

**Chạy test:** `npm test` (cần Node.js + chạy `npm install` lần đầu)

---

## 3. Cách sử dụng

### Mở tool
- **Online (GitHub Pages):** https://cuongmeocoder.github.io/vpbank-mso-tool — `index.html` (TC-only) hoặc `/compare.html` (TC vs TH)
- **Laptop/PC offline:** Double-click `VPBank_TinChap_TheChap_Calculator.html` → mở bằng Chrome hoặc Edge
- **Điện thoại offline:** Copy file vào điện thoại → mở bằng Chrome mobile
- **Chia sẻ nhanh:** Gửi file `.html` qua Zalo/email → đồng nghiệp mở ngay, không cần cài gì

> **Lưu ý 2 trang:** `index.html` chỉ có Tín Chấp. Để so sánh TC vs TH, dùng `compare.html` hoặc bấm link "⚖️ Xem So Sánh Tín Chấp vs Thế Chấp →" ở trang chủ.

### Nhập thông số
| Trường | Mô tả | Mặc định |
|--------|-------|----------|
| **Tên Khách Hàng** *(v1.1)* | Tuỳ chọn — hiện trên header khi in PDF | (trống) |
| **Tên MSO** *(v1.1)* | Tuỳ chọn — hiện trên header khi in PDF | (trống) |
| Số tiền vay | Nhập trực tiếp, tự format VNĐ | 1.000.000.000 |
| Thu nhập hàng tháng *(v1.2)* | Tuỳ chọn — tính tỷ lệ trả nợ / thu nhập | (trống) |
| TÍN CHẤP — Lãi suất cố định | %/năm, áp dụng toàn kỳ | 19% |
| THẾ CHẤP — Ưu đãi Năm 1 | %/năm, áp dụng tháng 1–12 | 7.5% |
| THẾ CHẤP — Thả nổi Năm 2 | %/năm, áp dụng từ tháng 13 | 11.5% |
| Kỳ hạn vay | Chọn tab: 12 / 24 / 36 / 48 / 60 / 72 / 84 tháng | 36 tháng |

### Nút thao tác *(v1.1)*

| Nút | Chức năng | Khi nào dùng |
|-----|-----------|--------------|
| 📋 **Copy Summary** | Sao chép tóm tắt vào clipboard (tên KH, MSO, số liệu chính) | Dán vào Zalo gửi khách trong 3 giây |
| 📄 **Xuất PDF** | Mở hộp thoại in trình duyệt → chọn "Save as PDF" | Gửi mail / in giấy cho khách |

> **Lưu ý:** Mọi thay đổi input đều cập nhật **tức thì** — không cần bấm nút Tính.

---

## 4. Công thức tính

### Tín Chấp — Phương pháp Niên Kim (PMT)
```
r_tháng = lãi_suất_năm / 12

PMT = P × r × (1+r)^n / [(1+r)^n − 1]

Mỗi tháng:
  Lãi trả   = Dư nợ đầu kỳ × r_tháng
  Gốc trả   = PMT − Lãi trả
  Dư nợ mới = Dư nợ cũ − Gốc trả
```

### Thế Chấp — Dư nợ giảm dần + Lãi thả nổi
```
Gốc trả/tháng = P / n  (cố định, chia đều)

Lãi suất áp dụng:
  Tháng 1–12  → lãi suất ưu đãi Năm 1
  Tháng 13+   → lãi suất thả nổi Năm 2

Mỗi tháng:
  Lãi trả   = Dư nợ đầu kỳ × (lãi_suất_áp_dụng / 12)
  Tổng trả  = Gốc trả + Lãi trả
```

### So sánh
```
Lệch tháng i   = Tổng trả TC(i) − Tổng trả TH(i)
Lệch lũy kế   = Σ Lệch từ tháng 1 đến tháng i
```

### Trả nợ trước hạn *(v1.4c)*
Tất toán ngay sau khi đã đóng kỳ M:
`Tổng chi phí tất toán = (Tổng đã trả từ T1 đến TM) + Dư nợ còn lại sau kỳ M + (Dư nợ còn lại × Phí phạt %)`

### Làm tròn hiển thị *(Cách C — áp dụng từ v1.1.1)*
```
Mỗi dòng dùng bộ số đã làm tròn riêng:
  Tổng trả hiển thị = Math.round(Tổng trả thô)
  Gốc trả hiển thị  = Math.round(Gốc trả thô)
  Lãi trả hiển thị  = Tổng trả hiển thị − Gốc trả hiển thị

Riêng tháng cuối:
  Gốc trả hiển thị = Số tiền vay − Σ Gốc trả hiển thị các tháng trước

Kết quả:
  Gốc + Lãi = Tổng tuyệt đối trên từng dòng
  Tổng gốc footer = đúng số tiền vay
  Footer = phép cộng tay các số đang hiển thị
```

---

## 5. Cấu trúc code

### index.html — Tín Chấp only (single-file HTML, Chart.js inline)
```
index.html
├── <script>          Chart.js 4.4.1 UMD nhúng inline (≈204 KB) — 100% offline
├── <style>           CSS responsive + @media print
├── Header            Logo + tiêu đề + link → compare.html
├── Input Card        Tên KH, Tên MSO, Số tiền, lãi suất TC, 7 kỳ hạn tabs
├── Sales Focus       Kết luận nhanh + tỷ lệ trả nợ / thu nhập
├── Summary Row       2 summary cards (TC tháng / Tổng TC)
├── Chart + Table     TC only
├── Comparison Card   So sánh 7 kỳ hạn TC song song (v1.6)
├── History Card      Lưu tối đa 5 phương án (localStorage, TTL 30 ngày) (v1.5)
└── <script>
    ├── buildRows()          Core calc TC + TH (dùng dummy TH tiers)
    ├── applyDisplayRounding() Cách C
    ├── renderComparison()   TC-only: 7 kỳ hạn, trả/tháng + tổng TC + % lãi
    └── calc()               Orchestrator
```

### compare.html — TC vs TH đầy đủ (single-file HTML, đồng bộ với VPBank_TinChap_TheChap_Calculator.html)
```
compare.html
├── Input Card        Tên KH, Tên MSO, Số tiền, TC rate, 3 TH tiers, phí phụ TH, 7 kỳ hạn
│                     Phí phụ: thẩm định (one-time), công chứng (one-time),
│                              bảo hiểm cháy nổ (mỗi năm × Math.ceil(KH/12)), phí khác (one-time)
├── Summary Row       3 cards: TC / TH / Chênh lệch
├── Insight Card      4 ô MSO lập luận
├── Chart + Table     12 cột TC vs TH
├── Comparison Card   7 kỳ hạn: TC/tháng, TH T1, TH T13, Tổng TC, Tổng TH thực, chênh lệch
├── History Card      Lưu tối đa 5 phương án (localStorage, TTL 30 ngày)
└── <script>
    ├── buildRows()          Core calc TC + TH
    ├── renderComparison()   TC vs TH: tổng TH thực = Σ totTH + feesForTerm
    │                        feesForTerm = thamDinh + congChung + baoHiemNam×ceil(n/12) + khac
    └── calc()               Orchestrator
```

**Thư viện ngoài:** Không có (Chart.js nhúng inline → 100% offline)

---

## 6. Kiểm tra số liệu mẫu

Với **P = 1 tỷ, TC = 19%, TH Y1 = 7.5%, TH Y2 = 11.5%, TH Y3+ = 12.5%, kỳ hạn 36 tháng:**

| Kỳ | TC trả/tháng | TH trả/tháng | Ghi chú |
|----|-------------|-------------|---------|
| T1 | 36.656.020 | 34.027.778 | TH rẻ hơn 2.6tr |
| T12 | 36.656.020 | 32.118.056 | TH rẻ hơn 4.5tr |
| **T13** | **36.656.020** | **34.166.667** | **⚠️ "Cú sốc" +2.0tr so T12** |
| T36 | 36.656.020 | 28.067.130 | TH rẻ hơn 8.6tr |
| **TỔNG (footer v1.5)** | **1.319.616.720** | **1.145.208.334** | TC trả thêm ~174.4tr |

> **Verify (Python độc lập):** công thức Niên Kim TC và Dư nợ giảm dần TH KHỚP chuẩn ngân hàng.

---

## 7. Điểm mạnh khi demo khách hàng

- **Nhập số tiền khách muốn vay → kết quả hiện ra ngay** → chuyên nghiệp, thuyết phục
- Biểu đồ đường thấy rõ **sự ổn định của TC** vs **đỉnh giảm rồi vọt lên của TH**
- Ô MSO Insight tự cập nhật số thực → MSO đọc luôn để chốt
- **Chạy offline 100%** (v1.1) — không cần wifi cả lần đầu lẫn các lần sau
- **In ra giấy / lưu PDF có tên KH + tên MSO** → trông như báo giá ngân hàng chính thức
- **Copy 1 click gửi Zalo** → follow-up khách nhanh

---

## 8. Giới hạn hiện tại (v1.7)

- Lịch sử tính toán (localStorage) lưu tối đa 5 phương án, TTL 30 ngày. Bị xoá nếu xoá cache hoặc duyệt ở chế độ ẩn danh.
- Bảng so sánh kỳ hạn dùng chung lãi suất đang nhập — không cho nhập lãi suất riêng từng kỳ hạn.
- **Phí bảo hiểm cháy nổ** (`feeBaoHiem`) là phí **mỗi năm**. Trong bảng so sánh 7 kỳ hạn, mỗi cột nhân `Math.ceil(n/12)` → kỳ hạn 84T = 7 năm. Main summary card dùng đúng số năm của KH đang chọn.
- `src/calculator.js` và `src/fees.js` là ES modules, **không dùng được trực tiếp trong file HTML mở bằng `file://`** (CORS). Dùng cho vitest test only; logic tương đương đã inline trong HTML.
- Test suite (`npm test`) cần Node.js và `npm install` — không chạy được trên trình duyệt.

---

## 9. Roadmap phát triển

### 🔴 v1.1 — ĐÃ HOÀN THÀNH (2026-05-18)
- ✅ Fix lệch làm tròn footer (Cách A — Math.round trên 6 tổng cột)
- ✅ Nhúng Chart.js inline → 100% offline
- ✅ Input Tên Khách Hàng + Tên MSO → hiện trên header
- ✅ Nút Xuất PDF (window.print + @media print CSS)
- ✅ Nút Copy Summary ra clipboard (gửi Zalo nhanh)

### 🔴 v1.1.1 — Ổn định số hiển thị (2026-05-18)
- ✅ Áp dụng **Cách C**: từng dòng `Gốc + Lãi = Tổng` tuyệt đối theo số đang hiển thị
- ✅ Tháng cuối hấp thụ phần lẻ làm tròn để **tổng gốc footer = đúng số tiền vay**
- ✅ Chart, bảng, summary và copy summary dùng cùng bộ số hiển thị
- ✅ Verify mẫu 1 tỷ / 36 tháng: 0 dòng lệch; tổng TC = 1.319.616.720 đ, tổng TH = 1.143.402.779 đ

### 🔴 v1.2 — Mobile Sales View (2026-05-18)
- ✅ Đưa **kết luận nhanh cho khách hàng** lên đầu trên điện thoại
- ✅ Thêm input **thu nhập hàng tháng** và hiển thị **tỷ lệ trả nợ / thu nhập**
- ✅ Thêm 4 lợi ích tín chấp VPBank: không cần tài sản đảm bảo, giải ngân nhanh, trả cố định, ít thủ tục tài sản
- ✅ Bảng chi tiết tự thu gọn mặc định trên mobile, có nút “Xem chi tiết từng tháng”
- ✅ Copy Summary bổ sung lợi ích tín chấp và tỷ lệ trả nợ nếu có nhập thu nhập

### 🔴 v1.3 — HOÀN THÀNH (2026-05-19)
- ✅ Sửa lỗi Safari iOS Canvas API.
- ✅ Bổ sung UI hints cho người dùng iPhone/iPad trong Modal Share Card.
- ✅ Sanitize filename khi download ảnh.
- ✅ Input validation cho các trường nhập lãi suất có visual warnings.

### 🔴 v1.4a — HOÀN THÀNH (2026-05-19)
- ✅ **Phí phụ thế chấp** (thẩm định + công chứng + bảo hiểm) → so sánh tổng chi phí thực

### 🔴 v1.4b — HOÀN THÀNH (2026-05-19)
- ✅ **Nhiều giai đoạn lãi thả nổi** (Y1, Y2, Y3+) — sát thực tế VPBank hơn

### 🔴 v1.4c — HOÀN THÀNH (2026-05-19)
- ✅ **Mô phỏng trả nợ trước hạn** (tất toán sau khi đã đóng kỳ M, tính thêm phí phạt trên dư nợ còn lại)

### 🟢 v1.5 — HOÀN THÀNH (2026-05-20)
- **Lưu nhiều phương án** (localStorage) — lưu tối đa 5 cấu hình tính toán.
- **Đồng bộ bản deploy**: `index.html` và `VPBank_TinChap_TheChap_Calculator.html` cùng nội dung.
- **Ổn định làm tròn tháng cuối TC**: tổng gốc Tín Chấp footer khớp đúng số tiền vay.

### 🔴 v1.6 — HOÀN THÀNH (2026-05-20)
- ✅ **So sánh tất cả kỳ hạn cùng 1 view** — bảng 7 cột (12/24/36/48/60/72/84T) song song: TC/tháng, TH T1, TH T13, Tổng TC, Tổng TH thực, chênh lệch, nhận định MSO. Kỳ hạn đang chọn được highlight xanh.
- ✅ **Fix feeBaoHiem per-term**: bảng so sánh nhân `feeBaoHiem × Math.ceil(n/12)` thay vì cố định 1 năm — label đổi thành "Bảo hiểm cháy nổ (mỗi năm)".

### 🟢 v1.7 — HOÀN THÀNH (2026-05-22)
- ✅ **2-page architecture**: `index.html` = Tín Chấp only (home); `compare.html` = TC vs TH đầy đủ.
- ✅ **Privacy (Sprint 3)**: TTL 30 ngày localStorage, nút "Xóa tất cả", disclaimer "🔒 Dữ liệu lịch sử chỉ lưu trên thiết bị này, không gửi lên server, và tự động xóa sau 30 ngày."
- ✅ **Test suite**: `src/calculator.js`, `src/fees.js`, `tests/calculator.test.js` (15 cases), `tests/fees.test.js` (7 cases) — `npm test` dùng vitest.
- ✅ **Sprint 4 Release QA**: checklist manual QA cho `index.html`, `compare.html`, GitHub Pages, và bản offline share.

---

## 10. Sprint 4 Release QA Checklist

### Test tự động
- Chạy `npm test` trước khi deploy.
- Kỳ vọng: `tests/calculator.test.js` và `tests/fees.test.js` đều pass.

### Manual QA — `index.html` (Tín Chấp only)
- Mở `/` hoặc double-click `index.html`.
- Đổi số tiền vay, lãi suất TC, kỳ hạn 12/36/84.
- Kiểm tra summary, chart, bảng chi tiết và bảng 7 kỳ hạn TC cập nhật đúng.
- Lưu phương án, tải lại phương án, xoá 1 dòng, bấm "Xóa tất cả".
- Kiểm tra disclaimer lịch sử: dữ liệu chỉ lưu trên thiết bị, không gửi server, tự xoá sau 30 ngày.
- Kiểm tra Copy Summary, Share Card, Xuất PDF.
- Bấm link "⚖️ Xem So Sánh Tín Chấp vs Thế Chấp →" sang `compare.html`.

### Manual QA — `compare.html` (TC vs TH)
- Mở `/compare.html` trực tiếp.
- Đổi TC rate, TH Y1/Y2/Y3+, số tiền vay, kỳ hạn.
- Nhập phí bảo hiểm/năm `5.000.000` và kiểm tra:
  - 12T = 5 triệu
  - 36T = 15 triệu
  - 84T = 35 triệu
- Kiểm tra summary, chart, bảng chi tiết, bảng so sánh 7 kỳ hạn.
- Test tất toán trước hạn với `M=1` và `M=KH-1`.
- Lưu/tải/xoá history, Copy Summary, Share Card, Xuất PDF.
- Bấm link "← Về Trang Tín Chấp" về `index.html`.

### Deploy QA — GitHub Pages
- Root URL mở đúng `index.html`: `https://cuongmeocoder.github.io/vpbank-mso-tool/`
- URL con mở đúng `compare.html`: `https://cuongmeocoder.github.io/vpbank-mso-tool/compare.html`
- Link nội bộ dùng relative path (`compare.html`, `index.html`) để chạy tốt cả GitHub Pages và file offline.
- `src/`, `tests/`, `package.json` có thể nằm trong repo public; HTML deploy không import trực tiếp các module này.
- `VPBank_TinChap_TheChap_Calculator.html` phải đồng bộ nội dung với `compare.html` nếu còn dùng để gửi offline.

### 🔵 v2.0+ — Mở rộng nghiệp vụ
- Tích hợp các sản phẩm vay khác của VPBank (vay mua xe, vay tiêu dùng…)
- Đa ngôn ngữ (VN/EN) cho khách nước ngoài
- Đồng bộ ngược lên hệ thống nội bộ VPBank nếu cần

---

## 11. Session Log — Nhật ký phiên làm việc

### 🗓 2026-05-18 · Phát hành v1.2 — Mobile Sales View

**Đã làm:**
1. **Chuyển trọng tâm sang khách hàng trên điện thoại:**
   - Thêm khối “Kết luận nhanh cho khách hàng”.
   - Trên mobile, khối kết luận được ưu tiên hiển thị trước phần nhập liệu.
   - Nội dung tập trung vào lợi ích tín chấp VPBank: nhanh, không cần tài sản đảm bảo, trả cố định.
2. **Thêm tỷ lệ trả nợ / thu nhập:**
   - Input mới: `Thu nhập hàng tháng`.
   - Hiển thị tỷ lệ cho Tín chấp và Thế chấp tháng 13.
   - Tự gắn nhãn: Dễ chịu / Cần cân nhắc / Áp lực.
3. **Thêm 4 lợi ích tín chấp VPBank:**
   - Không cần tài sản đảm bảo.
   - Giải ngân nhanh hơn.
   - Trả cố định mỗi tháng.
   - Ít thủ tục và chi phí liên quan tài sản.
4. **Tối ưu mobile:**
   - Bảng chi tiết tự thu gọn mặc định trên điện thoại.
   - Có nút “Xem chi tiết từng tháng” để mở khi cần.
5. **Copy Summary:**
   - Bổ sung lợi ích tín chấp VPBank.
   - Nếu có nhập thu nhập, summary kèm tỷ lệ trả nợ / thu nhập.

**Verify:**
- Desktop: bảng mở mặc định, 36 dòng, 0 dòng lệch `Gốc + Lãi != Tổng`.
- Mobile 390×844: bảng chi tiết ẩn mặc định, nút mở hoạt động.
- Input thu nhập 50.000.000 đ: DTI cập nhật đúng theo số trả hàng tháng.
- Copy Summary vẫn kích hoạt toast thành công.

**Định hướng tiếp theo:**
- Không nên làm thêm nhiều tính năng phức tạp ngay.
- Bước hợp lý tiếp theo là **Share Card dạng ảnh** để gửi Zalo nhanh, vì sát hành vi dùng trên điện thoại hơn PDF.
- Phí phụ thế chấp có thể làm sau Share Card nếu cần tăng lập luận “chi phí thực”.

---

### 🗓 2026-05-18 · Phát hành v1.1.1 — Cách C làm tròn hiển thị

**Đã làm:**
1. **Triển khai Cách C** trong `VPBank_TinChap_TheChap_Calculator.html`:
   - Tạo `applyDisplayRounding()` để chuẩn hoá số hiển thị ngay sau khi tính toán core.
   - Mỗi dòng đảm bảo `Gốc trả + Lãi trả = Tổng trả`.
   - Tháng cuối tự hấp thụ phần lẻ làm tròn để tổng gốc footer khớp đúng số tiền vay.
2. **Đồng bộ số hiển thị toàn tool:**
   - Bảng, footer, chart, summary cards, insight và copy summary dùng cùng bộ số đã làm tròn.
   - Tránh tình trạng bảng một số, summary/chart một số khác lệch vài đồng.
3. **Verify độc lập mẫu chuẩn:**
   - P = 1.000.000.000, TC = 19%, TH Y1 = 7.5%, TH Y2 = 11.5%, kỳ hạn 36 tháng.
   - 0 dòng lệch `Gốc + Lãi != Tổng`.
   - Tổng gốc TC = 1.000.000.000 đ; tổng gốc TH = 1.000.000.000 đ.
   - Tổng TC = 1.319.616.720 đ; tổng TH = 1.143.402.779 đ; chênh lệch = 176.213.941 đ.
4. **Cập nhật handoff.md** lên v1.1.1 và điều chỉnh roadmap v1.2.

**Giải thích định hướng v1.2:**
- Ưu tiên **DTI + phí phụ thế chấp** trước vì đây là lớp lập luận nghiệp vụ mạnh nhất khi gặp khách: MSO không chỉ nói "khoản nào rẻ hơn", mà còn chứng minh "khách có chịu nổi dòng tiền không" và "chi phí thực tế sau phí là bao nhiêu".
- DTI nên hiển thị theo từng phương án: tháng đầu, tháng 13, tháng cao nhất và cảnh báo nếu vượt ngưỡng nội bộ MSO muốn dùng.
- Phí phụ thế chấp nên có input riêng: thẩm định, công chứng, bảo hiểm, phí khác; sau đó cộng vào tổng chi phí TH để so sánh công bằng với TC.
- Nhiều giai đoạn lãi thả nổi và trả nợ trước hạn nên đi sau vì làm UI phức tạp hơn, nhưng vẫn nằm trong cùng nhánh "lập luận sâu".

**File bàn giao:**
- `VPBank_TinChap_TheChap_Calculator.html` — bản v1.1.1
- `VPBank_TinChap_TheChap_Calculator_v1.0_backup.html` — bản v1.0 gốc (rollback)
- `handoff.md` — đã cập nhật tự động sau triển khai

---

### 🗓 2026-05-18 · Audit dữ liệu + Phát hành v1.1

**Đã làm:**
1. **Audit công thức** — Verify độc lập bằng Python: công thức Niên Kim TC và Dư nợ giảm dần + Lãi thả nổi TH ĐÚNG chuẩn ngân hàng, khớp với code HTML và số liệu mẫu ở Mục 6.
2. **Phát hiện lệch hiển thị do làm tròn:**
   - Σ Gốc TH cộng tay = 1.000.000.008 đ vs Footer = 1.000.000.000 đ → lệch +8 đ
   - Σ Lãi TC / Tổng TC / Tổng TH: lệch 1 đ
   - Nguyên nhân: mỗi dòng round trước khi hiển thị, nhưng footer cộng giá trị thô rồi mới round.
3. **Fix Cách A:** Cộng giá trị đã `Math.round()` ở footer → khớp với phép cộng tay từng cột. ✅
4. **Phát hành v1.1** với 5 cải tiến:
   - Fix Cách A
   - Nhúng Chart.js inline (offline)
   - Input Tên KH + Tên MSO
   - Nút Xuất PDF (window.print)
   - Nút Copy Summary (clipboard)

**Quyết định kỹ thuật:**
- Chọn **Cách A** (đơn giản, an toàn) thay vì Cách B (dồn lẻ vào tháng cuối). Đánh đổi: footer column sums khớp ✓, nhưng Gốc+Lãi=Tổng vẫn lệch ±vài đồng (xem mục 8). Ưu tiên việc khách cộng tay từng cột vì đây là cách kiểm tra phổ biến.
- **Nhúng Chart.js inline** thay vì để CDN: file tăng từ 20KB → 231KB nhưng đổi lại 100% offline, không phụ thuộc internet khi gặp khách.
- **Export PDF** dùng `window.print()` thay vì html2pdf.js: 0 dependency thêm, hoạt động trên mọi browser, MSO chỉ cần chọn "Save as PDF" trong hộp thoại in.

**File bàn giao:**
- `VPBank_TinChap_TheChap_Calculator.html` — bản v1.1 mới
- `VPBank_TinChap_TheChap_Calculator_v1.0_backup.html` — bản v1.0 gốc (rollback)

**Đề xuất phiên sau:**
- Test in PDF thực tế trên máy in / browser khác nhau, chỉnh @media print nếu cần
- Triển khai v1.2 (DTI + phí phụ thế chấp) — cao giá trị nhất cho nghiệp vụ
- Cân nhắc Cách C cho per-row Gốc+Lãi=Tổng nếu khách phát hiện

---

*Được tạo bởi Claude AI (Anthropic) trong Cowork Mode · VPBank MSO NienKim*
