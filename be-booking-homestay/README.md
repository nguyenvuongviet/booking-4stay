# 🚀 4Stay – Booking Homestay Backend

Backend service cho nền tảng **4Stay**, xây dựng bằng **NestJS**, **Prisma ORM**, **MySQL**, hỗ trợ đầy đủ chức năng quản lý người dùng, phòng, đặt phòng, thanh toán VNPay, loyalty, đánh giá, Dashboard, Cloudinary và hệ thống gửi email.

## 📌 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Yêu cầu hệ thống](#-yêu-cầu-hệ-thống)
- [Cài đặt dự án](#-cài-đặt-dự-án)
- [Cấu hình môi trường (.env)](#-cấu-hình-môi-trường-env)
- [Khởi tạo database](#-khởi-tạo-database)
- [Chạy dự án](#-chạy-dự-án)
- [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
- [Danh sách API](#-danh-sách-api)
- [Tích hợp VNPay](#-tích-hợp-vnpay)
- [Upload Cloudinary](#-upload-cloudinary)
- [Dashboard Admin](#-dashboard-admin)
- [Ghi chú bảo mật](#-ghi-chú-bảo-mật)

## 📖 Giới thiệu

Dự án backend cung cấp API cho hệ thống đặt phòng homestay **4Stay**, bao gồm:

- Đăng ký, đăng nhập, xác thực OTP, Google Login, Đổi mật khẩu
- Quản lý người dùng và quản trị viên
- Quản lý phòng, ảnh, tiện ích, giường
- Hệ thống location đa cấp (Country → Province → District → Ward)
- Quản lý booking + cron job tự động cập nhật trạng thái
- Loyalty program
- Đánh giá phòng
- VNPay Payment + Refund
- Gửi email thông báo
- Dashboard thống kê doanh thu và booking

## 🧩 Công nghệ sử dụng

| Công nghệ         | Vai trò                  |
| ----------------- | ------------------------ |
| **NestJS**        | Framework backend        |
| **Prisma ORM**    | ORM kết nối MySQL        |
| **MySQL 8**       | Database chính           |
| **Swagger**       | Tài liệu API             |
| **Nodemailer**    | Gửi email                |
| **Cloudinary**    | Upload ảnh               |
| **VNPay Sandbox** | Thanh toán & refund      |
| **Passport JWT**  | Xác thực & phân quyền    |
| **Cron Job**      | Tự động cập nhật booking |

## ⚙️ Yêu cầu hệ thống

- Node.js **>= 18**
- NPM hoặc trình quản lý gói khác
- MySQL **>= 8.0**
- Git

## 📥 Cài đặt dự án

```bash
git clone https://github.com/your-repo/be-booking-homestay.git
cd be-booking-homestay
npm install
```

## 🔐 Cấu hình môi trường (.env)

Dự án có sẵn file:

```
.env.example
```

Tạo file `.env` theo `.env.example`:

```bash
cp .env.example .env
```

## 🗄 Khởi tạo database

Thư mục `db/` bao gồm:

- `db_booking_homestay.sql` → tạo bảng
- `db_trigger.sql` → trigger rating, review count, loyalty
- `db_insert.sql` → dữ liệu mẫu

### Cách 1: Import bằng MySQL Workbench

```sql
SOURCE ./db/db_booking_homestay.sql;
SOURCE ./db/db_trigger.sql;
SOURCE ./db/db_insert.sql;
```

### Cách 2: Prisma

```bash
npx prisma migrate dev
npx prisma generate
```

## ▶️ Chạy dự án

### Development

```bash
npm run start:dev
```

### Production

```bash
npm run build
npm run start:prod
```

## 📁 Cấu trúc thư mục

```
be-booking-homestay/
│── db/                     # SQL schema, triggers, seed data
│── dist/
│── prisma/
│   ├── schema.prisma
│
│── public/
│
│── src/
│   ├── common/             # Guards, decorators, middleware
│   ├── config/             # Config module
│   ├── helpers/            # Utils chia sẻ
│   ├── utils/              # Hàm tiện ích
│
│   ├── modules/
│       ├── amenity/
│       ├── auth/
│       ├── booking/
│       ├── cloudinary/
│       ├── dashboard/
│       ├── location/
│       ├── loyalty/
│       ├── mail/
│       ├── notification/
│       ├── otp/
│       ├── payment/
│       ├── prisma/
│       ├── review/
│       ├── room/
│       ├── token/
│       └── user/
│
│── test/
│── .env.example
│── package.json
│── README.md
```

## 🔗 Danh sách API

Dự án tự động tạo tài liệu API bằng Swagger:

```
http://localhost:3069/api/docs
```

### Nhóm API chính:

- **/auth** → Login, Register, OTP, Refresh, Google Login
- **/user** → CRUD user & admin
- **/location** → Countries, Provinces, Districts, Wards
- **/room** → Manage room, images, amenities
- **/bookings** → Booking, cancel, availability check
- **/review** → CRUD review
- **/loyalty** → Levels & user loyalty
- **/payment (VNPay)** → QR, callback, refund
- **/admin/dashboard** → Stats, revenue, bookings, popular rooms

## 💳 Tích hợp VNPay

### 1. Tạo URL/QR thanh toán

```
POST /api/create-qr
```

### 2. Callback sau thanh toán

```
GET /api/payment-return
```

### 3. Hoàn tiền

```
POST /api/refund
```

## ☁ Upload Cloudinary

Hỗ trợ:

- Upload ảnh local (multer)
- Upload Cloudinary
- Chọn ảnh chính
- Sắp xếp thư viện ảnh
- Xoá ảnh

## 📊 Dashboard Admin

Bao gồm:

- Tổng doanh thu
- Tổng booking
- Doanh thu theo tháng
- 5 phòng được đặt nhiều nhất
- Danh sách booking gần nhất
- Thống kê trạng thái booking

## 🔒 Ghi chú bảo mật

- Không commit file `.env`
- Không để lộ API key, secret
- Dùng App Password Gmail khi dùng SMTP
- Sử dụng HTTPS khi deploy production
