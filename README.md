# TN Ideal

Đồ án web full-stack dùng React, Node.js/Express và MongoDB Atlas. Ứng dụng quản lý ý tưởng dự án với các chức năng thêm, xem, cập nhật trạng thái và xóa dữ liệu.

## Chạy local

```bash
npm install
cp .env.example .env
npm run dev
```

Mở `http://localhost:5173`.

## MongoDB Atlas

1. Tạo cluster MongoDB Atlas.
2. Tạo database user.
3. Cho phép IP truy cập trong Network Access.
4. Copy connection string vào biến `MONGODB_URI` trong `.env`.

## Deploy Vercel

1. Push project lên GitHub.
2. Import repository trong Vercel.
3. Thêm Environment Variable:

```text
MONGODB_URI=mongodb+srv://...
```

4. Deploy. Vercel sẽ build React vào `dist` và chạy API qua `api/index.js`.
