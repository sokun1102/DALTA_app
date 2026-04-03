# Kiến thức cơ bản về API, API Gateway, Microservice, Controller & Service

Khi xây dựng một hệ thống theo hướng **Microservices**, việc phân chia trách nhiệm (Separation of Concerns) là cực kỳ quan trọng để hệ thống dễ bảo trì và mở rộng.

---

## 1. Phân biệt các thành phần chính

### 🌐 API Gateway (Cổng nối tiếp duy nhất)

Đóng vai trò là cửa ngõ duy nhất của toàn bộ hệ thống. Thay vì Client gọi trực tiếp vào hàng chục microservices khác nhau, nó chỉ gọi vào một địa chỉ duy nhất (Gateway).

- **Nhiệm vụ chính**:
  - **Routing**: Định tuyến request (Nếu gọi `/products`, Gateway sẽ chuyển đến Product Service).
  - **Security**: Xác thực (Authentication), phân quyền (Authorization) tập trung tại một nơi.
  - **Load Balancing**: Phân phối tải giữa các bản sao của service.
  - **Rate Limiting**: Chặn các request spam hoặc quá giới hạn.

### 🔌 API (Application Programming Interface)

Là tập hợp các quy tắc và định dạng để các hành phần phần mềm giao tiếp với nhau. Trong Microservices, API thường là **REST**, **gRPC** hoặc qua **Message Brokers** (như RabbitMQ).

### 🏗️ Microservice

Là một service nhỏ, độc lập, thực hiện một chức năng nghiệp vụ riêng biệt (ví dụ: Service quản lý Sản phẩm, Service quản lý Đơn hàng). Mỗi service nên có database riêng.

### 🛂 Controller (Người điều hướng)

Lớp nhận request đầu tiên bên trong một Microservice.

- **Nơi ở**: Thường nằm ở tầng biên của một module/service.
- **Trách nhiệm**:
  - Tiếp nhận yêu cầu từ Gateway hoặc Client.
  - Kiểm tra dữ liệu đầu vào (Validation/DTO).
  - Gọi đến lớp xử lý nghiệp vụ (Service).
  - Trả về kết quả cho phía gọi.
- **Nguyên tắc**: Không chứa logic nghiệp vụ phức tạp. Chỉ được làm "lễ tân".

### ⚙️ Service (Tầng xử lý Nghiệp vụ)

Nơi chứa toàn bộ trí tuệ và logic của ứng dụng.

- **Trách nhiệm**:
  - Tính toán, xử lý dữ liệu.
  - Thực hiện các quy tắc kinh doanh (Business Rules).
  - Tương tác với cơ sở dữ liệu (thông qua Repository/Entity).
- **Quy tắc vàng**: Code trong Service phải sạch, không phụ thuộc vào việc request đến từ API hay từ một task chạy ngầm (Cron job).

---

## 2. Luồng dữ liệu (Step-by-step)

1. **Client (Web/Mobile)** gửi request (vd: `GET /products/1`).
2. **API Gateway** tiếp nhận: Kiểm tra token (hợp lệ không?), sau đó tìm xem `/products` thuộc service nào.
3. **Product Microservice** nhận request tại **Controller**.
4. **Controller** kiểm tra: ID có phải là số không? Nếu ổn, gọi `ProductService.getById(id)`.
5. **Service** xử lý: Tìm trong DB, tính toán khuyến mãi nếu có, sau đó trả về dữ liệu.
6. **Controller** nhận kết quả, đóng gói vào JSON và trả về **Gateway**.
7. **Gateway** trả về cho **Client**.

---

## 3. Hướng dẫn Rã Module (Decomposition Guide)

Khi bạn muốn tách một module to thành các microservices nhỏ, hãy làm theo các bước:

### Phần nào "Port" vào đâu?

| Nếu là...                                      | Chuyển vào đâu?                                   | Vì sao?                                                                                                                 |
| :----------------------------------------------- | :---------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------- |
| **Routes, `@Get`, `@Post`**            | **Port vào Controller**                        | Đây là điểm tiếp xúc của module với thế giới bên ngoài.                                                     |
| **Logic tính tiền, Logic lưu kho**      | **Port vào Service**                           | Đây là lõi nghiệp vụ, cần độc lập để dễ test.                                                               |
| **Kết nối Database, Entity**             | **Port vào Database riêng của Service đó** | Đảm bảo tính độc lập dữ liệu (Encapsulation).                                                                   |
| **Cấu hình Security (JWT, Admin check)** | **Port vào API Gateway**                       | Để các Microservice bên trong không phải lo lắng về việc ai đang gọi nó (Trừ khi cần kiểm tra sâu hơn). |

### Chiến thuật "Cái gì thuộc về cái gì?"

- **Service** chỉ gọi **Service** cùng một Microservice.
- Nếu cần dữ liệu từ Microservice khác: **Gọi qua API** hoặc **Lắng nghe sự kiện (Events)** từ Microservice đó. Không bao giờ query trực tiếp chéo database.

---

**Tóm lại:**

- **Gateway**: Người gác cổng.
- **Controller**: Lễ tân (biết ai đến, cần gặp ai).
- **Service**: Nhân viên kỹ thuật (làm việc chính).
- **Microservices**: Các tòa nhà độc lập trong một khu đô thị (Hệ thống).
