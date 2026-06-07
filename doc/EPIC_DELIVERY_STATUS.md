# Epic Delivery Status

Mục tiêu: mỗi epic chỉ được xem là hoàn tất khi backend, database/API contract, frontend UI, validation và bước kiểm tra build/test đều đi qua cùng nhau.

## Definition of Done chung

- Backend có endpoint thật, DTO/validation rõ ràng, không nhận body `any` cho nghiệp vụ chính.
- Database/entity/migration phù hợp nghiệp vụ bán phụ tùng xe.
- Frontend có màn hình/flow thao tác thật qua API, không dùng dữ liệu giả cho nghiệp vụ chính.
- Thông báo UI bằng tiếng Việt, giữ tiếng Anh cho thuật ngữ kỹ thuật như SKU, ECU, fitment, carbon, titanium, Track Spec.
- Build backend và frontend pass.
- Test backend tối thiểu pass cho epic đang đóng.

## Trạng thái

| Epic | Tên | Trạng thái |
| --- | --- | --- |
| Epic 1 | Quản lý tài khoản | Đang đóng lại end-to-end |
| Epic 2 | Duyệt và tìm kiếm sản phẩm | Đã đóng phần chính |
| Epic 3 | Giỏ hàng | Chưa đóng theo chuẩn mới |
| Epic 4 | Thanh toán | Chưa đóng theo chuẩn mới |
| Epic 5 | Quản lý đơn hàng | Chưa đóng theo chuẩn mới |
| Epic 6 | Đánh giá và tương tác | Chưa đóng theo chuẩn mới |
| Epic 7 | Admin panel | Chưa đóng theo chuẩn mới |

## Epic 1 - Quản lý tài khoản

Đã làm trong lượt này:

- Chuẩn hóa DTO đăng ký, đăng nhập, quên mật khẩu, đặt lại mật khẩu.
- Thêm DTO cập nhật hồ sơ và địa chỉ giao hàng.
- Chuẩn hóa email về lowercase trước khi lookup/tạo tài khoản.
- Không leak `resetTokenExpiry` khi trả thông tin user.
- Địa chỉ đầu tiên tự động là mặc định; khi xóa địa chỉ mặc định, hệ thống chọn địa chỉ còn lại gần nhất làm mặc định.
- Frontend đăng nhập, đăng ký, quên mật khẩu, đặt lại mật khẩu được viết lại bằng tiếng Việt sạch và gọi API thật.
- Test backend auth/users được cập nhật để mock dependency đúng microservice.

Kiểm tra đã pass:

- `backend`: `npm.cmd test -- --runInBand`
- `backend`: `npm.cmd run build`
- `frontend`: `npm.cmd run build`

Việc còn cần kiểm tra thực tế trên server đang chạy:

- Đăng ký tài khoản mới bằng email thật.
- Đăng nhập lấy token và vào trang hồ sơ.
- Cập nhật hồ sơ cá nhân.
- Thêm/sửa/xóa/đặt mặc định địa chỉ giao hàng.
- Quên mật khẩu phụ thuộc service notifications/email.

## Epic 2 - Duyệt và tìm kiếm sản phẩm

Đã làm trong lượt này:

- Sửa thứ tự route products để các endpoint tĩnh như `/products/filters/brands`, `/products/search/query`, `/products/category/:categoryId` không bị bắt nhầm bởi `/products/:id`.
- Bỏ auto-seed dữ liệu nội thất/văn phòng trong products service; catalog chính phải dùng migration dữ liệu phụ tùng xe.
- Chuẩn hóa query DTO cho search, brand, color, size bằng cách trim input.
- Endpoint price range trả `min/max` dạng number thật.
- Homepage catalog lấy sản phẩm thật từ `/products`, danh mục từ `/categories`, filter từ `/products/filters/*`.
- Tách catalog thành trang riêng `/parts`; header tab Phụ Tùng, CTA homepage và footer sản phẩm đều trỏ về trang này.
- Thêm UI filter thật cho category, brand, màu/finish, size/fitment, còn hàng, mức giá, sort, keyword search.
- Mức giá được đẩy xuống backend bằng `minPrice/maxPrice` thay vì chỉ lọc giả ở frontend.
- Khi products API lỗi, catalog báo lỗi thật và không thay bằng dữ liệu preview.
- Trang chi tiết sản phẩm tải lại dữ liệu từ `/products/:id`, hiển thị thông số, tồn kho, giá, SKU và mô tả từ DB.
- Trang chi tiết gọi `/products/:id/related` và `/products/:id/frequently-bought-together` để dựng “Sản phẩm liên quan” và “Thường mua cùng”.

Kiểm tra đã pass:

- `backend`: `npm.cmd run build:products`
- `backend`: `npm.cmd run build`
- `frontend`: `npm.cmd run build`
- Runtime qua gateway `3005`: `/products?limit=3` trả 12 sản phẩm phụ tùng xe thật.
- Runtime qua gateway `3005`: `/categories` trả 6 danh mục phụ tùng xe.
- Runtime qua gateway `3005`: `/products/filters/brands` trả brand từ DB.
- Runtime qua gateway `3005`: search theo SKU `AT-APEX-WING-01` resolve đúng sản phẩm DB hiện tại.
- Runtime qua gateway `3005`: `/products/:id/related` trả sản phẩm liên quan với id DB thật.

Việc còn cần kiểm tra thực tế trên server đang chạy:

- Mở homepage và kiểm tra search theo tên, brand, SKU.
- Kiểm tra filter category, brand, màu/finish, size/fitment, còn hàng, mức giá.
- Mở detail từ sản phẩm DB và kiểm tra related/frequently-bought-together hiển thị đúng.
