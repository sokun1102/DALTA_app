# Hướng Dẫn Sử Dụng Git Dành Cho Team (Dự Án DALTA)

Tài liệu này là quy chuẩn bắt buộc để dự án hoạt động trơn tru. Tất cả thành viên vui lòng đọc kỹ!

## ⛔ QUY TẮC "SỐNG CÒN" (KHÔNG THỂ PHÁ VỠ)
1. **Tuyệt đối không đẩy thư mục `node_modules`, `vendor` hoặc các file IDE cá nhân (như `.vscode`) lên GitHub.**
2. **Tuyệt đối không đẩy file chứa mật khẩu như `.env` lên GitHub.** Khi có người mới, file `.env` phải được chia sẻ riêng tư qua chat nội bộ.
3. Không Push code đang lỗi (chưa chạy thành công) lên nhánh chung.
4. **Không ai được phép code trực tiếp và Push thẳng lên nhánh gốc `main`.**

---

## 🕒 Quy Trình Làm Việc Hằng Ngày (Daily Workflow)

### Bước 1: Kéo Code Mới Nhất
Khi bạn mở máy tính bắt đầu ngày làm việc:
```bash
git checkout main
git pull origin main
```
*Lưu ý: Nếu bị lỗi khi pull, hãy liên hệ ngay người viết phần code đó để tự hòa trộn (Merge) trước.*

### Bước 2: Tạo Nhánh Mới 
Khi bạn được giao nhiệm vụ mới (VD: Làm giao diện đăng nhập):
```bash
git checkout -b feat/login-ui
```
*Gợi ý đặt tên nhánh:* 
- `feat/tên-chức-năng` (cho tính năng mới)
- `fix/tên-lỗi` (cho sửa lỗi)

### Bước 3: Code và Commit
Bạn tiến hành viết code. Sau khi làm xong phần tử nhỏ, bạn lưu lại.
**Bắt buộc:** Tên commit (lời nhắn lưu) phải viết bằng **Tiếng Anh** và dùng **Conventional Commits**.
```bash
git add .
git commit -m "feat: design user login page in react"
```
#### Danh sách tiền tố (Prefix) của dự án:
- `feat:` Khi thêm chức năng/tính năng mới.
- `fix:` Khi sửa một lỗi (bug).
- `refactor:` Khi cấu trúc lại đoạn mã code cho gọn hơn nhưng tính năng không đổi.
- `docs:` Khi bổ sung file Hướng dẫn (README, Tự liệu...).
- `chore:` Làm các tác vụ linh tinh như cài thêm thư viện npm, update `.gitignore`...

### Bước 4: Đẩy nhánh lên GitHub
```bash
git push -u origin tên_nhánh_của_bạn
```

### Bước 5: Ghép code (Pull Request - PR)
Lên website GitHub, bạn bấm vào nút **"Compare & Pull Request"**. Gửi yêu cầu ghép code của bạn vào `main` để cho người khác làm **Code Review** (kiểm tra chéo).
Sau khi review thành công, bấm **Merge Pull request** để code được hòa nhập vào gốc.

Cảm ơn bạn đã hợp tác để tạo ra một môi trường làm việc chuyên nghiệp!
