# 🚀 4Stay – Booking Homestay Backend

Backend service cho nền tảng **4Stay**, được xây dựng bằng **NestJS (v11.x)**, **Prisma ORM**, **MySQL** và **TiDB**. Dự án tích hợp các công nghệ tiên tiến như **Trí tuệ nhân tạo (AI RAG)**, **Thanh toán trực tuyến PayOS**, **Thông báo đẩy (Web Push)**, và **Giao tiếp thời gian thực (Socket.io)**.

---

## 📌 Mục Lục
- [Giới thiệu](#-giới-thiệu)
- [Tính năng nổi bật](#-tính-năng-nổi-bật)
- [Công nghệ sử dụng](#-công nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt dự án](#-cài-đặt-dự-án)
- [Cấu hình môi trường (.env)](#-cấu-hình-môi-trường-env)
- [Khởi tạo Database & Dữ liệu mẫu](#-khởi-tạo-database--dữ-liệu-mẫu)
- [Chạy dự án](#-chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Tài liệu API (Swagger)](#-tài-liệu-api-swagger)
- [Ghi chú bảo mật](#-ghi-chú-bảo-mật)

---

## 📖 Giới Thiệu
Dự án backend cung cấp hệ thống API RESTful và Gateway WebSocket bảo mật, phục vụ toàn bộ nghiệp vụ đặt phòng homestay, quản trị viên, giao tiếp khách hàng và các tác vụ nền:
- **Xác thực & Người dùng:** Đăng ký, đăng nhập JWT (Access/Refresh Token), OTP xác thực email, đăng nhập qua Google OAuth, quản lý hồ sơ người dùng và phân quyền (User/Admin).
- **Quản lý Homestay:** CRUD thông tin phòng, tiện ích kèm theo, thư viện ảnh (tích hợp Cloudinary), danh mục vị trí đa cấp (Tỉnh thành/Quận huyện/Phường xã).
- **Quản lý Đặt phòng (Booking):** Đặt phòng, kiểm tra lịch trống, tự động hủy đơn quá hạn qua Cron Job, quản lý khóa lịch ngày (Calendar Lock).
- **Thành viên & Loyalty:** Chương trình điểm thưởng thành viên và thăng hạng thẻ (Bronze, Silver, Gold, Platinum).

---

## 🌟 Tính Năng Nổi Bật

### 1. Trợ lý ảo AI & Tìm kiếm ngữ nghĩa (AI RAG Chatbot)
- **Vector DB tự chế:** Sử dụng model `@google/generative-ai` (`gemini-embedding-2`) để vector hóa dữ liệu phòng, lưu trữ vào database.
- **Cosine Similarity:** Tìm kiếm nhanh in-memory top 5 phòng phù hợp nhất với truy vấn của người dùng để làm ngữ cảnh (Context) gửi kèm prompt đến model LLM (`gemini-2.0-flash-lite`).
- **Cơ chế Fallback:** Tự động phát hiện giới hạn hạn mức (Error 429) hoặc lỗi API để chuyển sang phản hồi tĩnh từ DB.
- **API Quản lý:** Admin có thể gọi endpoint `POST /api/chat/index` để lập chỉ mục lại toàn bộ dữ liệu phòng homestay vào RAG.

### 2. Hệ thống Gợi ý Cá nhân hóa (Recommendation Engine)
- **Hybrid Strategy:** Kết hợp giải pháp lọc dựa trên thuộc tính phòng (Content-Based) và hành vi của người dùng tương đồng (Collaborative Filtering) để đưa ra đề xuất tối ưu.
- **Contextual Boost:** Tự động điều chỉnh điểm số gợi ý dựa trên ngữ cảnh và thời gian thực.
- **Cache & Cron Job:** Tự động tính toán lại mức độ phổ biến (Popularity Score) định kỳ để giảm tải cho database khi truy vấn trang chủ.

### 3. Tích hợp thanh toán QR PayOS an toàn
- **Tạo link:** Tạo link thanh toán QR chuyển khoản trực tiếp (`POST /api/payos/create-link`) có hiệu lực trong thời gian giới hạn.
- **Webhook bảo mật:** Xác thực chữ ký webhook bằng khóa checksum SHA256 do PayOS cung cấp để chống giả mạo giao dịch (`POST /api/payos/webhook`).
- **Idempotency & Concurrency:** Đảm bảo mỗi webhook chỉ được xử lý đúng một lần và áp dụng Pessimistic Locking (`SELECT ... FOR UPDATE`) chống đặt trùng phòng.

### 4. Web Push Notification & Real-time Chat
- **Web Push:** Đăng ký thiết bị người dùng sử dụng giao thức VAPID qua thư viện `web-push` nhằm gửi thông báo đẩy trực tiếp đến trình duyệt khi có trạng thái đặt phòng mới.
- **Socket.io:** Kênh chat realtime giữa Khách hàng và Admin và hệ thống gửi thông báo trực tuyến khi khách hàng đang sử dụng app.

---

## 🧩 Công Nghệ Sử Dụng

| Công nghệ | Vai trò |
| :--- | :--- |
| **NestJS (v11.x)** | Framework backend chính |
| **Prisma ORM** | Giao tiếp database type-safe |
| **MySQL 8.x / TiDB** | Cơ sở dữ liệu chính (hỗ trợ lock vật lý) |
| **Generative AI** | Google Gemini SDK (`@google/generative-ai`) |
| **PayOS SDK** | Cổng thanh toán trực tuyến (`@payos/node`) |
| **WebSockets** | NestJS Gateways & Socket.io |
| **Web Push** | Thư viện `web-push` (VAPID) |
| **Nodemailer / Resend** | Gửi email kích hoạt, OTP, thông báo đơn hàng |
| **Cloudinary** | Quản lý và lưu trữ hình ảnh homestay |
| **Winston** | Ghi log hệ thống xoay vòng (Daily Rotate File) |

---

## ⚙️ Yêu Cầu Hệ Thống
- Node.js **>= 20**
- MySQL **>= 8.0** hoặc tài khoản TiDB Serverless
- Trình quản lý gói: **npm** hoặc **pnpm**

---

## 📥 Cài Đặt Dự Án

```bash
# Di chuyển vào thư mục backend
cd be-booking-homestay

# Cài đặt thư viện
npm install
```

---

## 🔐 Cấu Hình Môi Trường (.env)

Sao chép tệp cấu hình mẫu:
```bash
cp .env.example .env
```

Cập nhật các thông số quan trọng trong `.env`:
*   `DATABASE_URL`: Đường dẫn kết nối MySQL/TiDB.
*   `ACCESS_TOKEN_SECRET` & `REFRESH_TOKEN_SECRET`: Khóa bí mật ký token JWT.
*   `SENDER_EMAIL` & `SENDER_PASSWORD`: Email SMTP gửi OTP.
*   `GEMINI_API_KEY`: API key truy cập trợ lý ảo Gemini.
*   `PAYOS_CLIENT_ID`, `PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`: Thông tin cấu hình PayOS.
*   `CLOUDINARY_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Thông tin upload ảnh.
*   `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`: Cặp khóa VAPID của Web Push (tạo bằng lệnh `npx web-push generate-vapid-keys`).

---

## 🗄 Khởi Tạo Database & Dữ Liệu Mẫu

### Sử dụng Prisma (Khuyên dùng)
```bash
# Đồng bộ schema và tạo migration
npx prisma migrate dev --name init

# Khởi tạo Prisma Client
npx prisma generate

# Nạp dữ liệu mẫu từ script seeding
npm run seed
```

### Import SQL thủ công (Alternative)
Bạn có thể import các file dữ liệu trong thư mục `/db`:
1.  `db_booking_homestay.sql` (Schema khởi tạo)
2.  `db_trigger.sql` (Các trigger tự động tính rating và điểm loyalty)
3.  `db_insert.sql` (Danh mục tỉnh thành và dữ liệu phòng mẫu)

---

## ▶️ Chạy Dự Án

### Môi trường Phát triển (Development)
```bash
npm run start:dev
```

### Môi trường Product (Production)
```bash
# Build dự án
npm run build

# Khởi chạy bản build
npm run start:prod
```

---

## 📁 Cấu Trúc Thư Mục

```
be-booking-homestay/
├── db/                       # SQL dump schema, triggers, data mẫu
├── prisma/                   # Cấu hình Prisma schema và migration
│   ├── schema.prisma
│   └── migrations/
├── src/
│   ├── common/               # Guards, Decorators, Middlewares, Filters
│   ├── config/               # Cấu hình môi trường và hệ thống
│   ├── helpers/              # Các hàm bổ trợ dùng chung
│   ├── utils/                # Tiện ích định dạng, xử lý logic
│   └── modules/              # Các module chức năng chính
│       ├── amenity/          # Quản lý tiện nghi phòng
│       ├── app-configs/      # Cấu hình ứng dụng động
│       ├── auth/             # Xác thực JWT, Google Login, OTP
│       ├── blog/             # Quản lý bài viết SEO blog
│       ├── booking/          # Đặt phòng & Concurrency Lock
│       ├── chatbot/          # Trợ lý ảo AI & RAG (Gemini)
│       ├── cloudinary/       # API upload ảnh lên Cloudinary
│       ├── contact/          # Tiếp nhận liên hệ từ khách hàng
│       ├── dashboard/        # Báo cáo doanh thu và booking cho Admin
│       ├── favorite/         # Danh sách phòng yêu thích
│       ├── location/         # Cấu trúc địa giới hành chính (4 cấp)
│       ├── loyalty/          # Cấp độ thẻ thành viên & điểm thưởng
│       ├── mail/             # Service gửi email SMTP/Resend
│       ├── message/          # Quản lý tin nhắn realtime (Socket.io)
│       ├── notification/     # Quản lý thông báo Web Push & In-app
│       ├── otp/              # Tạo và kiểm tra mã OTP
│       ├── payos/            # Tích hợp cổng thanh toán PayOS
│       ├── prisma/           # Khởi tạo Prisma client service
│       ├── promotion/        # Quản lý mã giảm giá (coupon)
│       ├── recommendation/   # Hệ thống gợi ý cá nhân hóa
│       ├── review/           # Đánh giá & Bình luận phòng homestay
│       ├── room/             # Quản lý danh sách phòng & ảnh phòng
│       └── user/             # Quản lý tài khoản và phân quyền
└── package.json
```

---

## 🔗 Tài Liệu API (Swagger)

Backend của hệ thống tích hợp sẵn tài liệu tương tác API thông qua Swagger UI giúp quá trình phát triển và kiểm thử dễ dàng. Bạn truy cập vào địa chỉ sau khi Server backend đang hoạt động:

```
http://localhost:3069/api/docs
```

### Các nhóm API chính:
*   `/auth` - Đăng ký, đăng nhập JWT, Google OAuth, OTP
*   `/user` - Quản lý hồ sơ người dùng, phân quyền Admin
*   `/room` - Xem danh sách, chi tiết phòng, quản lý phòng (Admin)
*   `/bookings` - Đặt phòng, kiểm tra lịch trống, khóa ngày đặt
*   `/payos` - Tạo link QR PayOS, webhook nhận trạng thái thanh toán
*   `/chat` - Chatbot RAG Gemini, Re-index phòng homestay
*   `/recommendation` - Đề xuất phòng ("Dành riêng cho bạn", Phòng tương tự)
*   `/admin/dashboard` - Thống kê doanh thu, tỷ lệ lấp đầy, phòng yêu thích

---

## 🔒 Ghi Chú Bảo Mật
- Không được commit file `.env` lên Github.
- Đảm bảo cấu hình CORS an toàn, giới hạn IP gọi webhook từ cổng PayOS.
- Sử dụng HTTPS trên môi trường production.
- Cấu hình VAPID keys chuẩn xác cho tính năng thông báo đẩy.
