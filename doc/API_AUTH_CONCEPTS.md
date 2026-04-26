# Kiến Thức Cơ Bản Về API & Hệ Thống Xác Thực (Auth)

Tài liệu này tổng hợp các khái niệm về kiến trúc hệ thống và bảo mật dành cho dự án **DALTA**.

---

## I. Phân biệt API và API Gateway

### 1. API (Application Programming Interface)

Là giao diện lập trình ứng dụng, đóng vai trò là "cầu nối" để hai phần mềm nói chuyện với nhau.

* **Ví dụ:** Một API lấy danh sách sản phẩm (`GET /products`).
* **Đặc điểm:** Gắn liền với logic của một dịch vụ cụ thể.

### 2. API Gateway

Là một thành phần hạ tầng đứng trước toàn bộ các API của hệ thống.

* **Ví dụ:** NGINX, Kong, Ocelot, hoặc AWS API Gateway.
* **Chức năng chính:**
  * **Routing:** Điều hướng yêu cầu đến đúng Service.
  * **Bảo mật:** Kiểm tra Token trước khi cho phép vào trong.
  * **Rate Limiting:** Giới hạn số lần gọi để tránh sập server.

| Đặc điểm            | API                  | API Gateway                |
| :---------------------- | :------------------- | :------------------------- |
| **Bản chất**    | Công cụ giao tiếp | Cổng quản lý tập trung |
| **Vị trí**      | Tại từng Service   | Đứng đầu hệ thống    |
| **Trách nhiệm** | Xử lý dữ liệu    | Điều phối & Bảo vệ    |

---

## II. Hệ Thống Auth (Authentication & Authorization)

Hệ thống bảo mật thường chia làm 2 giai đoạn chính:

### 1. Authentication (Xác thực - Bạn là ai?)

Kiểm tra xem người đang truy cập có đúng là người họ khai báo hay không.

* **Phương thức:** Login bằng mật khẩu, OTP, sinh trắc học, Social Login (Google/FB).
* **Kết quả:** Nếu đúng, hệ thống cấp cho bạn một "tấm vé" (thường là **JWT Token**).

### 2. Authorization (Phân quyền - Bạn được làm gì?)

Dựa trên danh tính đã xác thực để quyết định quyền hạn.

* **Ví dụ:**
  * `User`: Chỉ được xem sản phẩm.
  * `Admin`: Được thêm, sửa, xóa sản phẩm.
* **Công cụ trong NestJS:** Thường dùng `Guards` và `Roles`.

---

## III. 5 Thành phần cốt lõi của Auth

1. **Principals (Chủ thể):** Người dùng (lưu trong table `users`).
2. **Credentials (Chứng chỉ):** Password (đã hash), OTP... dùng để đối chiếu.
3. **Identity Store:** Cơ sở dữ liệu lưu thông tin người dùng.
4. **Tokens / Sessions:** "Tấm vé" duy trì trạng thái đăng nhập (ví dụ: JWT).
5. **Rules & Guards:** Các chốt chặn kiểm tra logic quyền hạn tại mỗi API.

---

## IV. Luồng hoạt động của JWT (Trong dự án DALTA)

1. **Client** gửi Username/Password lên `/auth/login`.
2. **Server** kiểm tra trong DB, nếu đúng sẽ tạo một chuỗi mã hóa gọi là **JWT**.
3. **Client** nhận JWT và lưu vào `LocalStorage` hoặc `Cookie`.
4. Ở mỗi yêu cầu sau (ví dụ: lấy sản phẩm), Client gửi kèm JWT trong Header `Authorization: Bearer <token>`.
5. **Server (Guards)** giải mã JWT, nếu hợp lệ thì mới trả về dữ liệu.

---

*Tài liệu được khởi tạo ngày: 15/04/2026*
