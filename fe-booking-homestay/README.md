# 📌 4Stay – Booking Homestay Frontend

Giao diện người dùng (Client-Side) và Trang quản trị (Admin Dashboard) cho hệ thống đặt phòng homestay **4Stay**.

Ứng dụng được xây dựng tối ưu hóa trải nghiệm người dùng, hỗ trợ đa ngôn ngữ, tích hợp AI Chatbot và thông báo thời gian thực trên nền tảng **Next.js (v16.x - App Router)** và **TailwindCSS (v4.x)**.

---

## 🚀 Công Nghệ Sử Dụng

### Frontend Core
- **Next.js (v16.x)** (React 19, App Router)
- **TypeScript** (Đảm bảo kiểm soát kiểu chặt chẽ)
- **TailwindCSS (v4.x)** (Engine CSS mới nhất, tối ưu hiệu năng)
- **React Query (v5.x)** (Quản lý và cache các trạng thái fetch dữ liệu từ API)
- **Redux Toolkit** (Quản lý trạng thái toàn cục ứng dụng)

### Giao diện & Tương tác (UI/UX)
- **Shadcn UI & Radix UI** (Hệ thống component chất lượng cao, dễ tùy chỉnh)
- **Framer Motion** (Tạo các hiệu ứng chuyển động và micro-animations mượt mà)
- **Leaflet & React-Leaflet** (Bản đồ tương tác hiển thị vị trí homestay)
- **Tiptap Editor** (Trình soạn thảo văn bản giàu tính năng cho admin viết Blog)
- **Recharts** (Vẽ biểu đồ thống kê doanh thu và lượt đặt phòng của trang Admin)
- **Lucide React** (Bộ icon hiện đại)

### Tiện ích kết nối & Service Worker
- **Axios** (Thư viện gửi HTTP Request đến backend)
- **Socket.io Client** (Kết nối WebSocket để chat realtime và nhận thông báo tức thời)
- **Service Worker (`sw.js`)** (Đăng ký nhận thông báo đẩy Web Push thông qua khóa VAPID)
- **ExcelJS & File Saver** (Xuất báo cáo doanh thu ra file Excel cho Admin)

---

## ⚙️ Yêu Cầu Môi Trường
- Node.js phiên bản **>= 20**
- Trình quản lý gói: **npm** hoặc **pnpm**

---

## 📦 Cài Đặt Dự Án

### 1. Di chuyển vào thư mục frontend
```bash
cd fe-booking-homestay
```

### 2. Cài đặt các thư viện phụ thuộc
```bash
npm install
# hoặc sử dụng pnpm
pnpm install
```

---

## 🔐 Cấu Hình Môi Trường (.env)

Tạo file `.env` tại thư mục gốc của frontend:
```bash
cp .example.env .env
```

Cấu hình các tham số môi trường:
*   `NEXT_PUBLIC_API_BASE_URL`: URL API của Backend (Ví dụ: `http://localhost:3069`).
*   `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google Client ID phục vụ đăng nhập bằng Google OAuth.
*   `NEXT_PUBLIC_WEATHER_API_KEY`: API Key kết nối dịch vụ dự báo thời tiết tại homestay.

---

## ▶️ Chạy Dự Án

### Chạy chế độ phát triển (Development)
```bash
npm run dev
```
Giao diện ứng dụng sẽ chạy tại địa chỉ: `http://localhost:3000`

### Biên dịch & Chạy Product (Production)
```bash
# Biên dịch dự án
npm run build

# Khởi chạy ứng dụng
npm run start
```

---

## 🗂️ Cấu Trúc Thư Mục Frontend

```
fe-booking-homestay/
├── public/                     # Tài nguyên tĩnh (ảnh, favicon, Service Worker /sw.js)
├── src/
│   ├── app/                    # Routing chính của Next.js (App Router)
│   │   ├── (pages)/            # Các trang chức năng chính
│   │   │   ├── admin/          # Trang quản trị homestay (Dashboard, Rooms, Bookings, Blog...)
│   │   │   ├── blog/           # Danh sách và chi tiết bài viết Blog SEO
│   │   │   ├── booking/        # Luồng đặt phòng của khách hàng
│   │   │   ├── checkout/       # Trang thanh toán tích hợp PayOS
│   │   │   ├── contact/        # Giao diện liên hệ
│   │   │   ├── inbox/          # Hộp thư chat realtime với Host
│   │   │   ├── profile/        # Quản lý thông tin cá nhân & điểm loyalty
│   │   │   └── room/           # Chi tiết phòng & xem phòng ảo 360 độ
│   │   ├── auth/               # Đăng ký, Đăng nhập, OTP, Đổi mật khẩu
│   │   ├── layout.tsx          # Giao diện khung toàn ứng dụng
│   │   └── page.tsx            # Trang chủ chính (Landing Page)
│   │
│   ├── _components/            # Các React Component dùng chung
│   │   ├── ui/                 # Thiết kế cơ bản theo Shadcn UI
│   │   ├── chatbot/            # Khung chat trợ lý ảo AI (Gemini RAG)
│   │   ├── room/               # Component hiển thị danh sách phòng tương tự
│   │   └── ...                 # SearchBar, FilterBar, WeatherBadge...
│   │
│   ├── _hooks/                 # React Custom Hooks (usePushNotifications, useAuth...)
│   ├── _helper/                # Các hàm định dạng tiền tệ, ngày tháng
│   ├── constants/              # Khai báo hằng số, tiện ích, icon định danh
│   ├── context/                # Context API quản lý Auth, Notifications, Ngôn ngữ
│   ├── locales/                # JSON đa ngôn ngữ (Tiếng Việt / Tiếng Anh)
│   ├── models/                 # TypeScript Types & Interfaces
│   ├── services/               # Định nghĩa các hàm gọi API đến Backend
│   ├── store/                  # Cấu hình Redux Toolkit (State Management)
│   └── styles/                 # Tệp định dạng CSS tùy biến
└── package.json
```

---

## 🧩 Các Chức Năng Chính

### Phân Hệ Khách Hàng (Client-Side)
*   **Trợ lý ảo thông minh (AI Chatbot):** Hộp thoại chat AI hỗ trợ tư vấn và đề xuất phòng homestay phù hợp theo thời gian thực (tích hợp Gemini RAG).
*   **Đặt phòng & Thanh toán QR:** Luồng đặt phòng nhanh chóng, chống đặt trùng nhờ Calendar lock, liên kết trực tiếp cổng thanh toán **PayOS** hiển thị mã QR chuyển khoản chính xác số tiền.
*   **Hệ thống thông báo nâng cao:** Đăng ký nhận thông báo đẩy (**Web Push**) ngay cả khi không mở ứng dụng, nhận thông báo in-app realtime qua Socket.io.
*   **Hộp thư Inbox:** Nhắn tin trực tiếp với chủ nhà (Admin) để trao đổi thông tin.
*   **Hệ thống Loyalty:** Hiển thị thứ hạng thẻ (Bronze, Silver, Gold, Platinum) dựa trên số điểm tích lũy sau mỗi lần check-out để nhận ưu đãi giảm giá tự động.
*   **Bản đồ & Thời tiết:** Hiển thị bản đồ Leaflet vị trí homestay và Badge thời tiết khu vực homestay theo thời gian thực.

### Phân Hệ Quản Trị (Admin-Side)
*   **Dashboard Trực Quan:** Biểu đồ Recharts thống kê doanh thu, tổng số booking và trạng thái đặt phòng theo tháng/năm.
*   **Quản Lý Phòng & Lịch Đặt:** Giao diện xem lịch đặt phòng dạng Calendar, cho phép Admin chủ động khóa/mở khóa phòng vào các ngày đặc biệt.
*   **Soạn Thảo Bài Viết Blog:** Viết và đăng các bài viết chuẩn SEO sử dụng Rich Text Editor (Tiptap).
*   **Quản lý Loyalty & Coupon:** Thiết lập cấu hình thăng hạng thành viên và tạo mã giảm giá.
*   **Xuất Báo Cáo:** Hỗ trợ xuất dữ liệu hóa đơn đặt phòng và doanh thu ra file Excel.
