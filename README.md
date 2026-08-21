# TN Ideal

Đồ án full-stack gồm hai phần độc lập, được đặt tên rõ ràng để dễ học:

```text
TNIDEAL/
├── frontend/          # Giao diện React chạy trong trình duyệt
│   ├── src/components # Component giao diện có thể tái sử dụng
│   ├── src/pages      # Các màn hình lớn
│   └── src/services   # Các hàm gọi API backend
├── backend/           # Máy chủ Express và MongoDB
│   └── src/
│       ├── config     # Biến môi trường, kết nối database, phân quyền
│       ├── middleware # Kiểm tra đăng nhập và xử lý lỗi
│       ├── models     # Cấu trúc dữ liệu MongoDB
│       ├── routes     # Các endpoint API
│       ├── services   # Logic dùng lại giữa nhiều route
│       └── utils      # Hàm tiện ích nhỏ
├── api/index.js       # Cổng mỏng để Vercel gọi backend
└── package.json       # Lệnh điều khiển cả frontend và backend
```

## Cách chạy

Tại thư mục gốc dự án:

```bash
npm install
cp .env.example .env
npm run dev
```

Sau đó mở `http://localhost:5173`. Lệnh trên chạy đồng thời:

- Frontend: `http://localhost:5173`
- Backend: `http://127.0.0.1:4000`
- Kiểm tra backend: `http://127.0.0.1:4000/health`
- Swagger test API: `http://localhost:4000/api-docs`
- Trang học từng bước: `http://localhost:5173/hocthuat`

Có thể chạy riêng từng phần:

```bash
npm run dev:frontend
npm run dev:backend
```

## Luồng xử lý nên học trước

Ví dụ khi người dùng đăng nhập:

```text
AuthPage.jsx
  -> frontend/src/services/authApi.js
  -> POST /api/auth/login
  -> backend/src/routes/auth.js
  -> backend/src/models/User.js
  -> MongoDB
  -> JSON trả về frontend
```

Hãy đọc theo đúng thứ tự trên để thấy frontend và backend giao tiếp với nhau như thế nào. Frontend không truy cập MongoDB trực tiếp; frontend chỉ gửi HTTP request đến backend.

## Các lệnh thường dùng

```bash
npm run dev       # Chạy cả frontend và backend
npm run build     # Build frontend cho production
npm run lint      # Kiểm tra lỗi code toàn dự án
npm run server    # Chỉ chạy backend, không tự reload
```

## Biến môi trường

Không đưa file `.env` lên Git. Các biến backend cần dùng:

```text
MONGODB_URI=chuỗi-kết-nối-mongodb-atlas
MONGODB_DB=tnideal
PORT=4000
AUTH_SECRET=chuỗi-bí-mật-dài-và-ngẫu-nhiên
```

## Deploy Vercel

Vercel build giao diện vào `frontend/dist`. File `api/index.js` chỉ chuyển yêu cầu serverless sang ứng dụng Express trong `backend/src/app.js`, vì vậy toàn bộ logic backend vẫn nằm đúng trong thư mục `backend/`.

Trên Vercel, cần khai báo ít nhất `MONGODB_URI`, `MONGODB_DB` và `AUTH_SECRET` trong Environment Variables.

Đọc thêm tại [frontend/README.md](frontend/README.md) và [backend/README.md](backend/README.md).
