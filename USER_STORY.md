# User Stories - Website Bán Hàng (E-commerce)

Dưới đây là danh sách các User Stories cho một hệ thống website bán hàng trực tuyến, được chia theo các nhóm tính năng (Epics) chính.

## Epic 1: Quản lý Tài khoản (User Management)

*   **Là một** khách truy cập (Guest), **tôi muốn** có thể đăng ký tài khoản bằng email và mật khẩu hoặc qua mạng xã hội (Google, Facebook), **để** tôi có thể mua hàng, theo dõi đơn hàng và nhận ưu đãi.
*   **Là một** khách hàng (Customer), **tôi muốn** có thể đăng nhập/đăng xuất khỏi tài khoản của mình, **để** bảo vệ thông tin cá nhân và lịch sử mua hàng.
*   **Là một** khách hàng, **tôi muốn** có thể lấy lại mật khẩu khi quên qua email, **để** không bị mất quyền truy cập vào tài khoản.
*   **Là một** khách hàng, **tôi muốn** xem và cập nhật thông tin cá nhân (tên, số điện thoại, ngày sinh, avatar), **để** hồ sơ của tôi luôn chính xác.
*   **Là một** khách hàng, **tôi muốn** lưu nhiều địa chỉ giao hàng khác nhau, **để** tôi có thể dễ dàng chọn địa chỉ phù hợp khi thanh toán.

## Epic 2: Duyệt và Tìm kiếm Sản phẩm (Browsing & Searching)

*   **Là một** người dùng, **tôi muốn** xem danh sách các danh mục sản phẩm trên trang chủ, **để** dễ dàng điều hướng đến loại sản phẩm tôi đang tìm.
*   **Là một** người dùng, **tôi muốn** tìm kiếm sản phẩm bằng từ khóa (tên, hãng, mã sản phẩm), **để** tìm thấy chính xác món hàng tôi cần ngay lập tức.
*   **Là một** người dùng, **tôi muốn** lọc và sắp xếp danh sách sản phẩm (theo giá, đánh giá, màu sắc, kích cỡ, bán chạy, mới nhất), **để** tôi thu hẹp phạm vi tìm kiếm theo tiêu chí của mình.
*   **Là một** người dùng, **tôi muốn** xem chi tiết một sản phẩm (hình ảnh, mô tả, thông số kỹ thuật, giá cả, số lượng tồn kho), **để** tôi có đủ thông tin trước khi quyết định mua.
*   **Là một** người dùng, **tôi muốn** xem các sản phẩm gợi ý (có liên quan hoặc mua cùng nhau), **để** tôi có thêm lựa chọn mua sắm.

## Epic 3: Giỏ hàng (Shopping Cart)

*   **Là một** người dùng, **tôi muốn** thêm sản phẩm (với số lượng, màu sắc, kích cỡ tùy chọn) vào giỏ hàng, **để** tôi có thể thanh toán chúng cùng một lúc.
*   **Là một** người dùng, **tôi muốn** xem biểu tượng giỏ hàng hiển thị số lượng sản phẩm đang có ở mọi trang, **để** tôi luôn biết mình đã chọn bao nhiêu món.
*   **Là một** người dùng, **tôi muốn** xem chi tiết giỏ hàng, thay đổi số lượng hoặc xóa sản phẩm khỏi giỏ, **để** tôi điều chỉnh đơn hàng trước khi thanh toán.
*   **Là một** người dùng (kể cả chưa đăng nhập), **tôi muốn** giỏ hàng của tôi được lưu lại trong một thời gian, **để** tôi có thể tiếp tục mua sắm nếu chẳng may thoát trang.

## Epic 4: Thanh toán (Checkout)

*   **Là một** khách hàng, **tôi muốn** chọn địa chỉ giao hàng đã lưu hoặc nhập trực tiếp địa chỉ mới trong bước thanh toán, **để** hàng hóa được giao đúng nơi.
*   **Là một** khách hàng, **tôi muốn** chọn phương thức vận chuyển (tiêu chuẩn, hỏa tốc) với chi phí ước tính rõ ràng, **để** tôi quyết định thời gian nhận hàng.
*   **Là một** khách hàng, **tôi muốn** chọn phương thức thanh toán (COD, thẻ tín dụng, ví điện tử/Momo/ZaloPay, chuyển khoản ngân hàng), **để** tôi có thể thanh toán một cách thuận tiện nhất.
*   **Là một** khách hàng, **tôi muốn** áp dụng mã giảm giá (voucher/coupon) trước khi thanh toán, **để** tôi nhận được ưu đãi.
*   **Là một** khách hàng, **tôi muốn** xem bản tóm tắt toàn bộ đơn hàng (sản phẩm, phí ship, thuế, tổng tiền) trước khi nhấn nút "Đặt hàng", **để** đảm bảo không có sai sót.

## Epic 5: Quản lý Đơn hàng (Order Management)

*   **Là một** khách hàng, **tôi muốn** nhận được email/thông báo xác nhận ngay sau khi đặt hàng thành công, **để** tôi yên tâm là hệ thống đã ghi nhận đơn hàng.
*   **Là một** khách hàng, **tôi muốn** xem lịch sử tất cả các đơn hàng đã đặt của mình, **để** tôi có thể theo dõi chi tiêu và mua lại các sản phẩm cũ.
*   **Là một** khách hàng, **tôi muốn** theo dõi trạng thái đơn hàng hiện tại (Chờ xác nhận, Đang xử lý, Đang giao, Đã giao, Đã hủy), **để** biết khi nào hàng sẽ tới.
*   **Là một** khách hàng, **tôi muốn** có thể hủy đơn hàng khi nó vẫn đang ở trạng thái "Chờ xác nhận", **để** đổi ý mà không cần liên hệ tổng đài.

## Epic 6: Đánh giá và Tương tác (Reviews & Interactions)

*   **Là một** khách hàng, **tôi muốn** có thể đánh giá (rating 1-5 sao) và viết bình luận cho sản phẩm đã mua thành công, **để** chia sẻ trải nghiệm với người khác.
*   **Là một** người dùng, **tôi muốn** đọc nhận xét của những người đã từng mua sản phẩm, **để** có cái nhìn khách quan về chất lượng sản phẩm.
*   **Là một** khách hàng, **tôi muốn** thêm sản phẩm vào danh sách yêu thích (Wishlist), **để** tôi lưu lại và mua chúng vào dịp khác.

## Epic 7: Quản trị Hệ thống (Admin Panel) - Dành cho Admin/Nhân viên cửa hàng

*   **Là một** quản trị viên, **tôi muốn** xem Dashboard (tổng quan doanh thu, số đơn hàng mới, sản phẩm bán chạy), **để** nắm bắt tình hình kinh doanh nhanh chóng.
*   **Là một** quản trị viên, **tôi muốn** thêm, sửa, xóa, và ẩn/hiện sản phẩm cũng như danh mục, **để** quản lý kho hàng hóa hiển thị trên website.
*   **Là một** quản trị viên, **tôi muốn** xem và cập nhật trạng thái đơn hàng của khách, **để** điều phối quá trình đóng gói và vận chuyển.
*   **Là một** quản trị viên, **tôi muốn** quản lý tài khoản người dùng và phân quyền (Admin, Staff, Customer), **để** duy trì nền tảng và bảo mật phân quyền.
*   **Là một** quản trị viên, **tôi muốn** tạo và quản lý các mã giảm giá, chương trình khuyến mãi, **để** kích thích việc mua sắm của khách hàng.
*   **Là một** quản trị viên, **tôi muốn** quản lý và duyệt/ẩn các bình luận, đánh giá của khách hàng, **để** đảm bảo nội dung trên website luôn lành mạnh.
