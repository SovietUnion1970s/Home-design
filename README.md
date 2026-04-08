# AI-Powered 3D Home Designer 🏠✨ (Generation 2)

Hệ thống thiết kế nhà thông minh tích hợp AI, mang lại trải nghiệm thiết kế nội thất chuyên nghiệp từ bản vẽ 2D đến không gian 3D sống động.

## 🚀 Tính năng nổi bật (Sprint 3)

### 1. Hệ thống Auth & Bảo mật (JWT)
- **Hệ thống Đăng nhập & Đăng ký**: Tích hợp JWT (JSON Web Token) với phân quyền người dùng (Role-based: Homeowner, Contractor, Admin).
- **Lưu trữ dữ liệu an toàn**: Tất cả dự án được lưu trữ và mã hóa theo từng tài khoản cá nhân thông qua PostgreSQL & Prisma.

### 2. Trợ lý Thiết kế AI (AI Design Assistant)
- **AI Style Chat**: Trò chuyện với AI để nhận gợi ý phong cách (Nhật Bản, Bắc Âu, Hiện đại, Industrial, v.v.). AI sẽ tự động áp dụng vật liệu sàn và màu tường vào bản thiết kế 3D.
- **AI Feng Shui Checker**: Công cụ kiểm tra phong thủy tự động dựa trên thuật toán hình học, chấm điểm và gợi ý hóa giải cho bố cục mặt bằng.

### 3. Công cụ Thiết kế 3D Realistic
- **Vật liệu cao cấp (Texture Engine)**: Chuyển đổi linh hoạt giữa các loại sàn (Gỗ, Gạch men, Bê tông, Đá Marble) với hiệu ứng phản chiếu (Reflections) chân thực.
- **Furniture Model nâng cao**: Toàn bộ vật dụng được xây dựng lại với chi tiết tỉ mỉ (Sofa, Giường, Kệ TV) thay vì các khối hộp đơn giản.
- **Smart Analytics**: Tự động tính toán diện tích, số lượng gạch, lít sơn và dự toán ngân sách thi công theo thời gian thực.

### 4. Trải nghiệm người dùng (UX) chuyên nghiệp
- **Undo/Redo System**: Hỗ trợ lịch sử trạng thái thiết kế, cho phép quay lại hoặc làm lại mọi thao tác lỗi.
- **Hỗ trợ kéo thả & Transform**: Thao tác trực quan trong cả không gian 2D và 3D.
- **Glassmorphism Dark UI**: Giao diện mang phong cách đồ họa cao cấp (Coohom-inspired), bóng bẩy và chuyên nghiệp.

## 🛠 Công nghệ sử dụng

- **Frontend**: React (Vite), Zustand, React Three Fiber (R3F), Drei, Axios, Lucide React.
- **Backend**: NestJS, JWT Passport, Bcrypt.
- **Database**: PostgreSQL, Prisma ORM.

## 🏁 Khởi chạy dự án

1. **Cài đặt**: `npm install` (tại thư mục gốc để cài đặt tất cả dependencies).
2. **Setup DB**: `npx prisma migrate dev` trong folder `server`.
3. **Run**: `npm run start:dev` để khởi động cả Backend và Frontend cùng lúc.

## 🔑 Tài khoản Demo (Quick Test)

Bạn có thể đăng ký tài khoản mới trực tiếp hoặc sử dụng tài khoản demo dưới đây để xem sự khác biệt giữa các vai trò (Role):

- **Chủ nhà (Homeowner)**:
  - Email: `homeowner@demo.com`
  - Password: `demo123`
- **Nhà thầu (Contractor)**:
  - Email: `contractor@demo.com`
  - Password: `demo123`

*(Lưu ý: Nếu chưa có dữ liệu trong DB, hãy đăng ký tài khoản mới trước với đúng thông tin trên hoặc thông tin bất kỳ).*

---
*Phát triển bởi [Tên/Team của User] — 2026*
