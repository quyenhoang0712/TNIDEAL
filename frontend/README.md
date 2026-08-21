# Frontend

Frontend là phần người dùng nhìn thấy và tương tác trong trình duyệt. Công nghệ chính là React và Vite.

## Bắt đầu đọc code

1. `src/main.jsx` gắn ứng dụng React vào HTML.
2. `src/App.jsx` quản lý phiên đăng nhập và điều hướng màn hình chính.
3. `src/pages/` chứa từng màn hình.
4. `src/components/` chứa các khối giao diện nhỏ hơn.
5. `src/services/` gửi request đến backend.

Ví dụ `services/authApi.js` không kiểm tra mật khẩu. Nó chỉ gửi username/password đến `/api/auth/login`; backend mới là nơi xác thực thật sự.

## Chạy riêng frontend

Từ thư mục gốc:

```bash
npm run dev:frontend
```

Trong lúc phát triển, `vite.config.js` chuyển tiếp request `/api/*` sang backend ở cổng `4000`.

## Trang học thuật

Mở `http://localhost:5173/hocthuat` để học cấu trúc và luồng code của chính dự án theo từng bài. Tiến độ được lưu trong `localStorage` của trình duyệt.

Trang học có ba chế độ:

- 13 bài nền tảng về cấu trúc full-stack.
- Công nghệ và luồng: React, Node, thư viện, Google Map, camera, PDF, cách tìm nút và truy vết tính năng.
- Phân tích riêng từng file frontend/backend.
