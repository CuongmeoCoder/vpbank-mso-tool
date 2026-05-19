# Hướng Dẫn Sử Dụng VPBank MSO Tool

## 1. Mục tiêu sử dụng

Ứng dụng này dùng để MSO tư vấn nhanh cho khách hàng về lợi ích khi vay **Tín chấp VPBank** so với phương án **Thế chấp**.

Trọng tâm khi dùng với khách:
- Tín chấp không cần tài sản đảm bảo.
- Giải ngân nhanh hơn.
- Khoản trả hàng tháng cố định, dễ kiểm soát dòng tiền.
- Phù hợp khi khách cần vốn nhanh và muốn giữ tài sản linh hoạt.

---

## 2. Cách dùng trên điện thoại

### Android
1. Mở link online của ứng dụng bằng **Chrome**.
2. Nhập các thông tin chính:
   - Số tiền vay
   - Thu nhập hàng tháng nếu muốn xem tỷ lệ trả nợ / thu nhập
   - Lãi suất tín chấp
   - Lãi suất thế chấp
   - Kỳ hạn vay
3. Xem phần **Kết luận nhanh cho khách hàng** ở đầu màn hình.
4. Bấm **Copy Summary** để sao chép nội dung gửi Zalo.
5. Nếu cần xem bảng chi tiết, bấm **Xem chi tiết từng tháng**.

### iPhone
1. Mở link online bằng **Safari** hoặc **Chrome**.
2. Nhập số tiền vay và kỳ hạn.
3. Xem phần kết luận, lợi ích tín chấp và tỷ lệ trả nợ / thu nhập.
4. Bấm **Copy Summary** để gửi nhanh qua Zalo, SMS hoặc email.
5. Nếu muốn lưu lại, dùng chức năng chia sẻ của trình duyệt hoặc chụp màn hình.

### Thêm ra màn hình chính

Trên điện thoại, nên thêm ứng dụng ra màn hình chính để mở nhanh như app:

**Android Chrome**
1. Mở link ứng dụng.
2. Bấm nút ba chấm ở góc phải.
3. Chọn **Add to Home screen** hoặc **Thêm vào màn hình chính**.

**iPhone Safari**
1. Mở link ứng dụng.
2. Bấm nút **Share**.
3. Chọn **Add to Home Screen** hoặc **Thêm vào Màn hình chính**.

---

## 3. Cách dùng trên laptop / PC

1. Mở link online bằng **Chrome**, **Edge** hoặc **Safari**.
2. Nhập thông tin khách hàng nếu cần:
   - Tên khách hàng
   - Tên MSO
3. Nhập thông số vay.
4. Xem phần kết luận, summary, biểu đồ và bảng chi tiết.
5. Dùng:
   - **Copy Summary** để gửi Zalo/email.
   - **Xuất PDF** để in hoặc lưu báo giá dạng PDF.

---

## 4. Cách dùng trên tablet

Tablet dùng giống laptop nhưng thuận tiện hơn khi ngồi tư vấn trực tiếp:

1. Mở link online.
2. Đưa khách xem phần kết luận nhanh.
3. Cho khách thấy biểu đồ dòng tiền.
4. Nếu khách hỏi kỹ, mở bảng chi tiết từng tháng.
5. Copy summary gửi ngay cho khách sau buổi tư vấn.

---

## 5. Sử dụng online mọi lúc

### Trạng thái hiện tại

Link chính thức, miễn phí, không cần mật khẩu:

```text
https://cuongmeocoder.github.io/vpbank-mso-tool/
```

Link Netlify anonymous cũ **không dùng làm link chính thức** vì có mật khẩu và không ổn định lâu dài nếu chưa claim tài khoản.

Yêu cầu mới:
- Mở link là vào app ngay, **không cần mật khẩu**.
- Miễn phí.
- Link ổn định, dùng lâu dài.
- Dùng tốt trên điện thoại.

### Phương án khuyến nghị: GitHub Pages

Đây là phương án phù hợp nhất cho dự án hiện tại.

Lý do:
- Miễn phí với repository public.
- Không có mật khẩu.
- Link ổn định lâu dài.
- Hợp với app HTML tĩnh, không cần backend.
- Mỗi lần cập nhật chỉ cần push file mới lên GitHub.

Link đang dùng:

```text
https://cuongmeocoder.github.io/vpbank-mso-tool/
```

Link GitHub Pages thường có dạng:

```text
https://ten-github-cua-ban.github.io/ten-repo/
```

Ví dụ nếu tài khoản GitHub là `nienkim` và repo là `vpbank-mso-tool`:

```text
https://nienkim.github.io/vpbank-mso-tool/
```

### File đã chuẩn bị để deploy

Đã tạo file:

```text
index.html
```

File này là bản deploy online của:

`VPBank_TinChap_TheChap_Calculator.html`

GitHub Pages cần file tên `index.html` để mở link gốc là vào app ngay.

### Cách deploy bằng GitHub Pages

1. Đăng nhập GitHub.
2. Tạo repository mới, ví dụ:

```text
vpbank-mso-tool
```

3. Để repository ở chế độ **Public** nếu dùng GitHub Free.
4. Upload các file tối thiểu:
   - `index.html`
   - `huongdan.md`
   - `handoff.md`
5. Vào **Settings → Pages**.
6. Ở phần **Build and deployment**:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
7. Bấm **Save**.
8. Chờ khoảng 1-3 phút.
9. Mở link GitHub Pages được cấp.

### Cách cập nhật app sau này

Khi có bản mới:

1. Cập nhật `VPBank_TinChap_TheChap_Calculator.html`.
2. Copy nội dung bản mới sang `index.html`.
3. Commit và push lên GitHub.
4. GitHub Pages tự cập nhật sau khoảng 1-3 phút.

### Phương án thay thế: Cloudflare Pages

Cloudflare Pages cũng miễn phí và tốt cho static site, nhưng vẫn cần tài khoản Cloudflare.

Nên chọn Cloudflare Pages nếu:
- Muốn tốc độ tốt.
- Muốn quản lý nhiều site.
- Có thể đăng nhập Cloudflare và kết nối GitHub.

Với dự án này, **GitHub Pages là đủ đơn giản và bền nhất**.

---

## 6. Cách cập nhật phiên bản online

Khi có bản mới:

1. Kiểm tra file mới chạy đúng trên máy tính.
2. Đổi tên file mới thành `index.html`.
3. Upload đè lên bản đang dùng trên hosting.
4. Mở link bằng điện thoại để kiểm tra lại.
5. Nếu trình duyệt vẫn hiện bản cũ, thử:
   - Refresh lại trang.
   - Đóng mở lại trình duyệt.
   - Xoá cache nếu cần.

Nên ghi rõ phiên bản trong `handoff.md` để biết đang dùng bản nào.

---

## 7. Lưu ý khi tư vấn khách hàng

- Đây là công cụ minh hoạ và tư vấn nhanh, không thay thế phê duyệt tín dụng chính thức.
- Lãi suất thực tế phụ thuộc chính sách VPBank, hồ sơ khách hàng và từng thời điểm.
- Không nên nhập thông tin quá nhạy cảm của khách nếu dùng link public.
- Nên dùng tên khách hàng ngắn hoặc mã khách nếu cần bảo mật.
- Khi gửi summary cho khách, MSO nên nhấn mạnh: số liệu mang tính tham khảo, cần kiểm tra theo sản phẩm thực tế.

---

## 8. Quy trình tư vấn nhanh trên điện thoại

1. Mở link app từ màn hình chính.
2. Nhập số tiền vay.
3. Chọn kỳ hạn.
4. Nhập thu nhập hàng tháng nếu khách muốn xem khả năng trả nợ.
5. Cho khách xem phần kết luận nhanh:
   - Tín chấp trả cố định bao nhiêu mỗi tháng.
   - Thế chấp tháng 13 có thể tăng thế nào.
   - Lợi ích: nhanh, không cần tài sản đảm bảo, dễ kiểm soát dòng tiền.
6. Bấm **Copy Summary**.
7. Dán vào Zalo gửi khách.

---

## 9. Khuyến nghị triển khai

Nếu cần dùng online ngay: chọn **Netlify Drop**.

Nếu cần link ổn định lâu dài cho cả đội: chọn **GitHub Pages** hoặc **Cloudflare Pages**.

Tên file khi đưa lên online nên là:

```text
index.html
```

Như vậy người dùng chỉ cần mở link chính, không phải nhớ tên file dài.
