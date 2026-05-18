# 📋 HANDOFF — VPBank MSO Tool: Tín Chấp vs Thế Chấp
> **Phiên bản:** v1.0 · **Ngày:** 18/05/2026 · **Tác giả:** MSO NienKim × Claude AI

---

## 1. Mục tiêu Tool

Tool được xây dựng cho **MSO (Market Sales Officer) VPBank** nhằm:

- Trực quan hoá và so sánh dòng tiền **Tín Chấp (Niên Kim cố định)** vs **Thế Chấp (Dư nợ giảm dần + Lãi thả nổi)**
- Tự động tính toán khi nhập thông số — không cần Excel, không cần cài đặt
- Dùng được trên **laptop, điện thoại, máy tính bảng** qua bất kỳ trình duyệt nào
- Hỗ trợ MSO **lập luận chốt khách hàng** với số liệu thực tế

---

## 2. File deliverable

| File | Mô tả |
|------|-------|
| `VPBank_TinChap_TheChap_Calculator.html` | Web App chính — mở bằng Chrome/Edge/Safari |
| `Bang_Tinh_TC_NienKim_Vs_TH_GiamDan_ThaNoi.xlsx` | File Excel gốc (nguồn tham khảo cấu trúc) |
| `handoff.md` | Tài liệu này |

---

## 3. Cách sử dụng

### Mở tool
- **Laptop/PC:** Double-click file `.html` → mở bằng Chrome hoặc Edge
- **Điện thoại:** Copy file vào điện thoại → mở bằng Chrome mobile
- **Chia sẻ nhanh:** Gửi file `.html` qua Zalo/email → đồng nghiệp mở ngay, không cần cài gì

### Nhập thông số
| Trường | Mô tả | Mặc định |
|--------|-------|----------|
| Số tiền vay | Nhập trực tiếp, tự format VNĐ | 1.000.000.000 |
| TÍN CHẤP — Lãi suất cố định | %/năm, áp dụng toàn kỳ | 19% |
| THẾ CHẤP — Ưu đãi Năm 1 | %/năm, áp dụng tháng 1–12 | 7.5% |
| THẾ CHẤP — Thả nổi Năm 2 | %/năm, áp dụng từ tháng 13 | 11.5% |
| Kỳ hạn vay | Chọn tab: 12 / 24 / 36 / 48 / 60 / 72 / 84 tháng | 36 tháng |

> **Lưu ý:** Mọi thay đổi đều cập nhật **tức thì** — không cần bấm nút Tính.

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

---

## 5. Cấu trúc code (single HTML file)

```
VPBank_TinChap_TheChap_Calculator.html
├── <style>        CSS responsive (mobile-first, CSS variables)
├── Header         Logo VPBank + tiêu đề sticky
├── Input Card     4 input fields + 7 kỳ hạn tabs
├── Summary Row    3 summary cards (TC / TH / Chênh lệch)
├── Insight Card   4 ô MSO lập luận — tự cập nhật số
├── Chart Card     Line chart Chart.js (CDN)
├── Table Card     Bảng 13 cột scrollable
└── <script>
    ├── buildRows()      Tính toán core (TC + TH)
    ├── renderTable()    Render bảng HTML
    ├── renderChart()    Render Chart.js
    ├── updateSummary()  Cập nhật summary + insight
    └── calc()           Orchestrator — gọi khi input thay đổi
```

**Thư viện ngoài duy nhất:** Chart.js 4.4.1 (CDN từ cdnjs.cloudflare.com)

---

## 6. Kiểm tra số liệu mẫu

Với **P = 1 tỷ, TC = 19%, TH Y1 = 7.5%, TH Y2 = 11.5%, kỳ hạn 36 tháng:**

| Kỳ | TC trả/tháng | TH trả/tháng | Ghi chú |
|----|-------------|-------------|---------|
| T1 | 36.656.020 | 34.027.778 | TH rẻ hơn 2.6tr |
| T12 | 36.656.020 | 32.118.056 | TH rẻ hơn 4.5tr |
| **T13** | **36.656.020** | **34.166.667** | **⚠️ "Cú sốc" +2.0tr so T12** |
| T36 | 36.656.020 | 28.043.981 | TH rẻ hơn 8.6tr |
| **TỔNG** | **1.319.616.721** | **1.143.402.778** | TC trả thêm 176.2tr |

---

## 7. Điểm mạnh khi demo khách hàng

- **Nhập số tiền khách muốn vay → kết quả hiện ra ngay** → chuyên nghiệp, thuyết phục
- Biểu đồ đường thấy rõ **sự ổn định của TC** vs **đỉnh giảm rồi vọt lên của TH**
- Ô MSO Insight tự cập nhật số thực → MSO đọc luôn để chốt
- Chạy offline, không cần wifi khi gặp khách

---

## 8. Giới hạn hiện tại (v1.0)

- Chưa có chức năng **in / export PDF** để đưa cho khách
- Thế chấp hiện tính 1 giai đoạn thả nổi (từ tháng 13); chưa hỗ trợ nhiều giai đoạn lãi suất
- Chưa có **tên khách hàng / tên MSO** trên header
- Chưa có **lịch sử tính toán** (so sánh nhiều phương án)
- Chart.js cần **kết nối internet** lần đầu (có thể nhúng offline nếu cần)

---

## 9. Hướng phát triển tiếp (v2.0+)

Xem chi tiết trong phần **Đề xuất Roadmap** phía dưới hoặc trao đổi thêm với AI.

---

*Được tạo bởi Claude AI (Anthropic) trong Cowork Mode · VPBank MSO NienKim*
