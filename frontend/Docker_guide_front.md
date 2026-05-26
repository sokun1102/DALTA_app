Dockerfile Frontend (React + Vite)
Tổng quan về Multi-stage Build
Thay vì nhồi nhét mọi thứ vào một container duy nhất, chúng ta chia quá trình làm 2 giai đoạn
1.tạo 1 cái thùng chứa toàn bộ các file nặng như nodejs,node modules
2.tạo 1 cái thùng chứa những cái nhẹ nhàng hay chỉnh sửa chỉ giữ lại bề mặt ngoài thành phẩm 
Giai đoạn tạo các file nặng
                    FROM node:20-alpine AS builder
From thường để tạo môi trường ở đây ta sài hệ điều hành Linux siêu nhẹ (hậu tố alpine) đã cài sẵn Node.js phiên bản 20. Chúng ta đặt tên cho giai đoạn này là builder để lát nữa dễ dàng gọi lại
                    WORKDIR /app
WORKDIR thường để đặt nơi làm việc kiểu mình chọn làm ở file nào không để cũng được có thể tự vào bằng lệnh nhưng nếu ghi thì sẽ tạo 1 thư mục app bên trong docker mọi thao tác như copy đồ sau này sẽ làm trong đây 
                    COPY package*.json ./
*
Copy là bốc các file thư mục từ máy tính của mình bỏ vào bên trong máy docker 
Copy còn có copy .. ".."là copy toàn bộ src 
Copy -- form là để chia giai đoạn như mình làm
còn có ADD
*
ADD và copy cũng giống nhưng add làm đưuọc mọi thứ copy làm nhưng có thể nhiều điều hơn đó là có thể 
tải file từ url 
Tự động giải nén: Nếu nguồn là một file nén (.tar.gz, .zip, ...), Docker sẽ tự xả nén nó ra thành thư mục khi đưa vào Image


-Như trên là copy file package để tối ưu hóa cache ta chỉ cần copy 2 file package.json va package-lock.json
để tận dụng layer caching nếu sau này mình đổi giao diện nhưng k cài thêm thư viện mới thì k cần tải thư viện cũ vì tải thư viện là tốn thời gian
                    RUN npm ci
RUn này là chạy các lệnh của hệ điều hành cài đặt thư viện, tạo thư mục, biên dịch code
-ta dùng ci thay vì npm install vì lệnh này bắt buộc tải chính xác từng phiên bản thư viện đã được chốt trong file package-lock.json, không tự động nâng cấp hay thay đổi gì đảm bảo code chạy trên máy cá nhân thế nào thì lên Server chạy y hệt như thế
                    COPY . .
cái này là copy toàn bộ src vào thư mục app
                    RUN npm run build
Kích hoạt quá trình nén và đóng gói code của Vite. Sau khi chạy xong, toàn bộ code React phức tạp sẽ được dịch thành các file HTML/CSS/JS tĩnh thuần túy
----------------------------------------------------------------------------------------------------
Giai đoạn chạy
                    FROM nginx:alpine
tạo 1 máy chủ Nginx cũng dùng bản alpine siêu nhẹ sài cái này đẻ chạy thì web sẽ nhanh hơn 
                    COPY --from=builder /app/dist /usr/share/nginx/html
///
/dist là quy định của công cụ Vite Khi bạn chạy lệnh npm run build Vite sẽ tự động gom tất cả code React/JS/CSS đã nén lại và ném vào một thư mục tên là dist
/usr/share/nginx/html
Đây là đường dẫn mặc định của phần mềm Nginx. Khi bạn dùng FROM nginx:alpine, những người tạo ra cái Image Nginx này đã cài đặt sẵn Hễ có ai truy cập vào web, tôi sẽ tự động vào thư mục /usr/share/nginx/html để lấy file ra hiển thị
--from=builder cái này là để nó k kiếm trên thư mục trong máy mà nó kiếm trong docker giai đoạn 1 
///
câu này quan trọng vì nó kêu docker quay lại giai đoạn builder lúc nãy, copy ĐÚNG thư mục /app/dist mang sang thả vào thư mục phát web mặc định của Nginx mấy cái nặng nặng như node modules bị gạt đi cho nhẹ file
                    EXPOSE 80
khai báo cổng giai tiếp
                    CMD ["nginx", "-g", "daemon off;"]
Câu lệnh mặc định sẽ được kích hoạt khi Container bắt đầu chạy Lệnh này ép Nginx phải chạy ở chế độ nền trước
ngăn không cho Container tự động tắt đi ngay sau khi khởi động
---
có thể phân biệt lại run và cmd là khác nhau hoàn toàn
run là chạy lúc đang build dùng để cài đặt các thư viện đồ
còn cmd là để chạy app là khi muốn chạy app để sài thì mình sài cmd
