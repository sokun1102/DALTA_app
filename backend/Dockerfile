# ==========================================
# GIAI ĐOẠN 1: BUILD CODE (Bếp nấu ăn)
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# ==========================================
# GIAI ĐOẠN 2: RUNTIME (Nhà hàng phục vụ)
# ==========================================
FROM node:20-alpine

WORKDIR /app

# Copy các file cần thiết từ giai đoạn build
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Mở cổng 3000 (theo file .env)
EXPOSE 3000

# Chạy ứng dụng NestJS ở chế độ production
CMD ["npm", "run", "start:prod"]
