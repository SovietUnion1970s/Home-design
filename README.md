# 🏠 HomeDesign AI: Nền tảng Thiết kế Nội thất 3D Thế hệ mới

[![Docker Support](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)
[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/Backend-NestJS-E0234E?logo=nestjs)](https://nestjs.com/)

**HomeDesign AI** là một monorepo mạnh mẽ dành cho việc thiết kế căn hộ, tích hợp trí tuệ nhân tạo (AI) để biến những ý tưởng phác thảo thành không gian sống 3D sống động chỉ trong vài giây.

---

## ✨ Điểm nhấn Công nghệ (Sprint 3)

### 🤖 Trợ lý Thiết kế AI (Gemini Inside)
*   **AI Style Chat**: Trò chuyện tự nhiên với AI để nhận gợi ý về màu sắc, chất liệu và phong cách (Wabi-Sabi, Scandinavian, Industrial...). 
*   **Auto-Apply**: AI không chỉ nói suông mà còn tự động áp dụng các thông số màu tường, vật liệu sàn vào Canvas 3D của bạn.

### 📐 Công cụ 3D Chuyên nghiệp
*   **Engine PBR Realistic**: Hiệu ứng ánh sáng và vật liệu (Gỗ, Đá, Kim loại) với độ phản chiếu chân thực như đời thật.
*   **Thao tác Trực quan**: Hệ thống kéo thả nội thất với Gizmo điều khiển thông minh giúp bạn xoay, di chuyển vật dụng chính xác đến milimet.
*   **Snapping Logic**: Tự động hít (snap) đồ đạc vào tường để bố cục luôn ngăn nắp và khoa học.

### 🔒 Nền tảng Đám mây
*   **Auth Đa nền tảng**: Đồng bộ hóa dự án qua Google OAuth.
*   **Lưu trữ Cloud**: Mọi biến đổi trong thiết kế được lưu trữ thời gian thực vào PostgreSQL thông qua Prisma ORM.

---

## 🚀 Cách chạy dự án (One-Click Setup)

Dự án đã được **Docker hóa toàn phần 100%**. Bạn không cần cài đặt Node.js hay Database trên máy thật của mình.

### 1. Yêu cầu hệ thống
*   Cài đặt [Docker Desktop](https://www.docker.com/products/docker-desktop/).
*   (Tùy chọn) CPU hỗ trợ ảo hóa để Docker chạy mượt nhất.

### 2. Khởi động (Siêu nhanh)

*   **Windows**: Chạy file `setup.bat`.
*   **Mac/Linux**: Chạy lệnh `./setup.sh`.

> [!TIP]
> Script sẽ tự động nhận diện và tạo các file cấu hình môi trường `.env`. Sau khi chạy, hãy mở:
> - **Frontend**: `http://localhost:5173`
> - **Backend API**: `http://localhost:3000`

### 3. Cấu hình Google Login (Dành cho Developer)
Để tính năng Đăng nhập Google hoạt động, bạn hãy mở file `server/.env` và điền thông tin Client ID của bạn vào:
```env
GOOGLE_CLIENT_ID=abc...
GOOGLE_CLIENT_SECRET=xyz...
```

---

## 🛠 Tech Stack
*   **Core**: TypeScript, NestJS, React.
*   **Visualization**: Three.js, React Three Fiber, Nginx.
*   **Infrastructure**: Docker, Docker Compose, PostgreSQL, Prisma.
*   **AI**: Google Gemini Pro SDK.

---
*Phát triển bởi [Tên/Team của User] — Đưa công nghệ thiết kế vào tầm tay mọi người.*

