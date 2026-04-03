# ==========================================
# GIAI ĐOẠN 1: BUILD CODE (Bếp nấu ăn)
# ==========================================
# Sử dụng image Node.js làm môi trường gốc
FROM node:20-alpine AS builder

# Tạo một thư mục tên là /app bên trong máy ảo Docker để chứa code
WORKDIR /app

# Copy 2 file package.json và package-lock.json (nếu có) vào trước
# Việc này giúp Docker tận dụng cache, tải thư viện nhanh hơn ở các lần sau
COPY package*.json ./

# Tải và cài đặt các thư viện (mô phỏng lệnh bạn hay gõ)
RUN npm install

# Sau khi cài thư viện xong, copy toàn bộ code (src, public, vite.config.js...) vào máy ảo
COPY . .

# Chạy lệnh đóng gói code của Vite. Thành quả sinh ra sẽ nằm ở thư mục /app/dist
RUN npm run build

# ==========================================
# GIAI ĐOẠN 2: CHẠY WEB SERVER (Nhà hàng)
# ==========================================
# Sử dụng Nginx (một web server cực nhẹ và nhanh) để chạy file tĩnh
FROM nginx:alpine

# Copy thành quả (thư mục dist) từ GIAI ĐOẠN 1 sang thư mục phục vụ web của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Mở cổng 80 để cho phép bên ngoài truy cập vào web
EXPOSE 80

# Câu lệnh mặc định để Nginx luôn chạy ngầm
CMD ["nginx", "-g", "daemon off;"]