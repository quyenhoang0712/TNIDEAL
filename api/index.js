// Vercel chỉ tự nhận Serverless Function trong thư mục api/.
// Logic backend thật nằm trong backend/; file này chỉ là cổng triển khai.
export { default } from '../backend/src/app.js';
