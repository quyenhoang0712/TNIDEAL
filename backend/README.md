# Backend

Backend là phần chạy trên máy chủ, nhận request từ frontend, kiểm tra quyền và đọc/ghi MongoDB.

## Bắt đầu đọc code

1. `src/server.js` mở cổng local.
2. `src/app.js` tạo Express app và gắn các route.
3. `src/routes/` định nghĩa từng API.
4. `src/middleware/auth.js` xác thực token và quyền admin.
5. `src/models/` định nghĩa dữ liệu lưu trong MongoDB.
6. `src/services/` và `src/utils/` chứa logic được dùng lại.

`app.js` và `server.js` được tách riêng để cùng một Express app có thể chạy theo hai cách:

- Local: `server.js` gọi `app.listen(...)`.
- Vercel: `api/index.js` export trực tiếp `app` thành Serverless Function.

## Một route hoạt động thế nào?

Ví dụ `GET /api/constructions`:

```text
request
  -> middleware requireAuth
  -> route constructions.js
  -> model Construction.js
  -> MongoDB
  -> response JSON
```

## Chạy riêng backend

Từ thư mục gốc:

```bash
npm run dev:backend
```

Backend đọc cấu hình từ file `.env` ở thư mục gốc dự án.

## Test API bằng Swagger

Khi backend đang chạy, mở:

```text
http://localhost:4000/api-docs
```

Quy trình test API có đăng nhập:

1. Mở nhóm `Auth` và chạy `POST /api/auth/login`.
2. Sao chép giá trị `token` trong response.
3. Bấm nút `Authorize` ở đầu trang Swagger.
4. Dán token vào ô xác thực, không cần thêm chữ `Bearer`.
5. Chạy các API công trình, vật tư, chi phí hoặc admin.

OpenAPI JSON có tại `http://localhost:4000/api-docs.json`. Nội dung tài liệu được khai báo trong `src/docs/openapi.js`.
