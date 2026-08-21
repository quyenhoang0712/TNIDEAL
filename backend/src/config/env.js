import dotenv from 'dotenv';

// Khi chạy từ thư mục gốc, toàn bộ cấu hình bí mật nằm trong file .env ở gốc dự án.
dotenv.config({ path: new URL('../../../.env', import.meta.url), quiet: true });

export const PORT = process.env.PORT || 4000;
export const AUTH_SECRET = process.env.AUTH_SECRET || 'tnideal-local-secret';
