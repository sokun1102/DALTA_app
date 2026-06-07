# Design System: AEROTEC Premium

## 1. Visual Theme & Atmosphere
Giao diện AEROTEC được thiết kế theo phong cách tối giản công nghệ cao kết hợp với trình diễn cơ khí kỹ thuật số (Futuristic Dark-Tech / Cinematic). Giao diện sử dụng cấu trúc lưới bất đối xứng (asymmetric grid) và các hoạt ảnh spring-physics mượt mà để tạo chiều sâu và cảm giác cao cấp.
* **DESIGN_VARIANCE:** 8 (Sử dụng lưới bất đối xứng, thẻ biến đổi đa dạng)
* **MOTION_INTENSITY:** 7 (Hoạt ảnh bay lơ lửng, chuyển cảnh rạp phim, xoay dial telemetry)
* **VISUAL_DENSITY:** 4 (Thông số chi tiết nhưng rộng rãi, thoáng đãng như một showroom nghệ thuật)

## 2. Color Palette & Roles
* **Charcoal Canvas** (#050505) — Nền chính của toàn bộ trang web
* **Pure surface** (#0a0a0a) — Màu nền của các thẻ card, container kính mờ
* **Muted Steel** (#71717a) — Chữ mô tả, chú thích, thông số phụ
* **Pure Silk White** (#f8fafc) — Chữ tiêu đề chính, các nút nhấn lớn
* **Accent Rose Pink** (#f43f5e) — Accent chính cho trạng thái hoạt động, viền neon mờ, tiêu điểm chính
* **Accent Burnt Orange** (#f97316) — Accent chuyển tông cho các dải màu gradient trên nút bấm và chữ tiêu điểm
* **Whisper Border** (rgba(248, 250, 252, 0.08)) — Viền ngăn cách cấu trúc siêu mảnh 1px

## 3. Typography Rules
* **Display / Headlines:** `Outfit` — Tương phản cao, nén khoảng cách chữ (tracking-tight), mang lại cảm giác thời thượng, tương lai.
* **Body / Text:** `Space Grotesk` — Mở rộng nhẹ, thoáng đãng, dễ đọc ở mọi tỷ lệ.
* **Mono / Telemetry:** `Geist Mono` — Phục vụ riêng cho các con số kỹ thuật, SKU, thông số vòng quay mã lực để tạo cảm giác cơ khí chính xác.
* **Banned:** `Inter`, `Roboto` (các font phổ thông AI hay tự động điền) và các font Serif truyền thống trong giao diện điều khiển.

## 4. Component Stylings
* **Buttons:** Bo góc pill-shape (full round) cho các nút hành động chính, nút gradient Rose-Orange phẳng, không đổ bóng thô cứng. Hiệu ứng chạm tactile phản hồi vật lý (`translateY(-2px)` khi hover và co lại `scale(0.98)` khi nhấn).
* **Cards:** Bo góc lớn (`12px` đến `16px`), viền mờ `Whisper Border`. Khi hover phát hào quang nhẹ màu rose neon phía sau và nâng lên.
* **Inputs/Forms:** Nhãn luôn nằm trên ô nhập liệu, viền chuyển sắc nhẹ khi focus. Không sử dụng nhãn bay (floating labels).
* **Loading/Empty States:** Trình tải dạng khung xương (Skeletal) chuyển động phát sáng đồng bộ, tuyệt đối không dùng vòng xoay tròn đơn điệu.

## 5. Layout Principles
* Bố cục lưới CSS Grid kiểm soát tỷ lệ cột trên desktop, tự động chuyển đổi thành 1 cột trên thiết bị di động (mobile collapse).
* Các phần Hero, banner quảng cáo phải nằm gọn trong khung nhìn chính, giới hạn chiều cao tối thiểu bằng `min-h-[100dvh]` để tránh hiện tượng nhảy layout trên trình duyệt di động.
* Sử dụng sự tương phản về kích thước chữ và khoảng cách khoảng trống tiêu chuẩn (asymmetric spacing) thay vì dùng quá nhiều đường kẻ chia khung.

## 6. Motion & Interaction
* Hoạt ảnh trượt và zoom dựa trên spring-physics (`stiffness: 100, damping: 20`) để tạo độ đầm và quán tính thực tế.
* Hoạt ảnh chuyển video trên trang Tech sử dụng chớp sáng flash mờ dần (transition fade-in/out) kết hợp với đèn trạng thái live nhấp nháy chậm.
* Xoay liên tục dial Neural v4.0 theo trục 2D để tạo cảm giác hệ thống đang tính toán liên tục.

## 7. Anti-Patterns (Banned - Cấm)
* **Tuyệt đối KHÔNG dùng emoji** trên giao diện chính. Tất cả icon phải sử dụng glyphs hoặc ký hiệu đồ họa vector sạch.
* **Không dùng font Roboto hay Inter** làm hiển thị thương hiệu.
* **Không dùng màu đen tuyệt đối (#000000)** cho nền và các ô phát video.
* **Không lặp lại quá nhiều nhãn uppercase (eyebrow)** trên các tiêu đề mục tiếp nối (Giới hạn tối đa 1 eyebrow cho 3 section liên tục).
* **Không dùng các từ ngữ sáo rỗng của AI** như "Unleash", "Seamless", "Elevate", "Next-Gen". Thay bằng các mô tả thông số kỹ thuật thực tế và ngôn ngữ kỹ thuật chuẩn mực.
