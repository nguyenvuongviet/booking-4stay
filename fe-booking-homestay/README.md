# 📌 4Stay – Booking Homestay Frontend

<!-- <p align="center">
  <img src="https://res.cloudinary.com/nguyenvuongviet/image/upload/v1730000000/4stay/banner.png" alt="4Stay Banner" width="100%" />
</p> -->

<p align="center">
  <b>Giao diện người dùng & Admin Dashboard cho hệ thống đặt phòng 4Stay</b><br/>
  Xây dựng bằng Next.js 16 · TailwindCSS · Shadcn UI · Redux Toolkit · React Query
</p>

<!-- # 📷 **Screenshots**

| Homepage                                                            | Room Detail                                                            |
| ------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| <img src="https://placehold.co/700x400?text=Homepage+Screenshot" /> | <img src="https://placehold.co/700x400?text=Room+Detail+Screenshot" /> |

| Checkout                                                            | Admin Dashboard                                                            |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| <img src="https://placehold.co/700x400?text=Checkout+Screenshot" /> | <img src="https://placehold.co/700x400?text=Admin+Dashboard+Screenshot" /> | -->

## 🚀 Công nghệ sử dụng

### Frontend Framework

- **Next.js 16** (React 19)
- **TypeScript**
- **TailwindCSS 4**
- **Shadcn UI**
- **Leaflet Maps**
- **React Query**
- **Redux Toolkit**

### UI / Interaction

- Lucide Icons
- Framer Motion
- React Datepicker / Day Picker
- React Hot Toast
- DnD Kit

### Utilities

- Axios
- ExcelJS + File Saver
- dotenv
- Date-fns

## 🧭 Yêu cầu môi trường

### Node.js phiên bản tối thiểu

```bash
Node.js >= 18.17
```

Theo yêu cầu của Next.js 16.

### Package manager

Bạn có thể dùng:

- npm
- yarn
- pnpm (khuyến nghị)
- bun

## 📦 Cài đặt dự án

### Clone source

```bash
git clone https://github.com/your-repo/fe-booking-homestay.git
cd fe-booking-homestay
```

### Cài dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

## 🔐 Cấu hình môi trường (.env.local)

Tạo file `.env.local` từ tập tin `.example.env` ngay tại root:

```bash
cp .example.env .env.local
```

## ▶️ Chạy dự án

### Chạy chế độ dev:

```bash
npm run dev
```

Truy cập:

```
http://localhost:3000
```

### Build production:

```bash
npm run build
npm start
```

## 🗂️ Cấu trúc thư mục FE

```
src/
├── app/                      # Next.js routing
│   ├── (pages)/admin         # Admin dashboard UI
│   ├── room/[id]             # Room detail page
│   ├── booking               # Booking pages cho user
│   ├── ...                   # Booking pages cho user
│   └── api/                  # Server actions
│
├── components/
│   ├── bookings/             # Booking UI components
│   ├── admin/                # Admin components
│   ├── ui/                   # Shadcn UI
│   ├── layout/               # Header, Footer
│   └── payment/              # VNPay UI and flows
│
├── constants/                # Icons, amenities
├── hooks/                    # Custom hooks
├── lib/                      # Formatters, utilities
├── services/                 # API call tới backend
├── models/                   # TS Interfaces
├── context/                  # Auth & Language context
└── redux/                    # Redux Toolkit store
```

## 🧩 Chức năng chính của FE

### Dành cho User

- Đăng nhập / Đăng ký / Google OAuth
- Tìm kiếm phòng, lọc theo vị trí
- Xem chi tiết phòng, tiện nghi, host info
- Kiểm tra phòng còn trống
- Đặt phòng + thanh toán VNPay
- Hủy phòng + tính tiền hoàn tự động
- Xem lịch sử booking
- Gửi đánh giá sau khi checkout
- Hệ thống Loyalty: cấp bậc + điểm

### Dành cho Admin

- Dashboard thống kê
- Quản lý phòng (CRUD)
- Quản lý ảnh phòng, tiện nghi
- Quản lý người dùng
- Quản lý booking
- Biểu đồ doanh thu, trạng thái booking
- Export báo cáo Excel
- Notification Realtime (WebSocket + Email)

## 🔌 API Backend sử dụng

FE gọi tới NestJS Backend:

### /auth

- POST /auth/login
- POST /auth/register
- POST /auth/google
- POST /auth/refresh

### /rooms

- GET /rooms
- GET /rooms/:id
- GET /rooms/:id/unavailable-days

### /bookings

- POST /bookings
- GET /bookings/me
- GET /bookings/:id
- PATCH /bookings/:id/cancel

### /payments (VNPay)

- POST /payments/vnpay
- GET /payment-return

### /admin

- CRUD rooms
- CRUD users
- CRUD locations
- Dashboard APIs

## 🚀 Build & Deploy

### Build:

```bash
npm run build
```

### Deploy lên Vercel:

```bash
vercel deploy
```
