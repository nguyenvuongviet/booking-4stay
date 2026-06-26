# 🏡 4Stay – Nền Tảng Đặt Phòng Homestay Trực Tuyến Tích Hợp AI RAG

**4Stay** là dự án xây dựng một nền tảng đặt phòng homestay khép kín dành cho mô hình đơn chủ sở hữu (Single-host). Dự án được thiết kế hiện đại, tập trung vào trải nghiệm người dùng, khả năng tối ưu hóa công cụ tìm kiếm (SEO) và tích hợp các công nghệ tiên tiến như **AI RAG (Gemini)**, **Thanh toán trực tuyến (PayOS)**, **Web Push Notification**, và **Kiểm soát đặt phòng đồng thời (Concurrency Control)**.

---

## 📌 Mục Lục
* [Giới thiệu dự án](#-giới-thiệu-dự-án)
* [Kiến trúc hệ thống](#-kiến-trúc-hệ-thống)
* [Các tính năng nâng cao nổi bật](#-các-tính-năng-nâng-cao-nổi-bật)
* [Danh mục công nghệ sử dụng](#-danh-mục-công-nghệ-sử-dụng)
* [Hướng dẫn cài đặt & Triển khai nhanh](#-hướng-dẫn-cài-đặt--triển-khai-nhanh)
  * [Bước 1: Clone dự án](#bước-1-clone-dự-án)
  * [Bước 2: Cài đặt và khởi chạy Backend (NestJS)](#bước-2-cài-đặt-và-khởi-chạy-backend-nestjs)
  * [Bước 3: Cài đặt và khởi chạy Frontend (Next.js)](#bước-3-cài-đặt-và-khởi-chạy-frontend-nextjs)
* [Tài liệu API (Swagger)](#-tài-liệu-api-swagger)

---

## 📖 Giới Thiệu Dự Án

Hệ thống **4Stay** bao gồm hai phân hệ chính:
1.  **Client-Side (Khách hàng):** Ứng dụng Web Next.js giúp khách hàng tìm kiếm phòng theo địa điểm, ngày lưu trú, số lượng khách; xem thông tin tiện nghi; tương tác trực tiếp với trợ lý ảo AI để nhận đề xuất phòng; đặt phòng và thanh toán trực tuyến qua mã QR; quản lý lịch sử đặt phòng và tích lũy điểm thành viên.
2.  **Admin-Side (Quản trị viên):** Trang quản trị bảo mật giúp chủ homestay theo dõi báo cáo doanh thu dưới dạng biểu đồ; quản lý danh sách phòng, trạng thái khóa ngày (Calendar View); kiểm duyệt bình luận/đánh giá; thiết lập mã giảm giá và cấp độ thẻ thành viên.

---

## ⚙️ Kiến Trúc Hệ Thống

Dự án được xây dựng dưới dạng **Monorepo** bao gồm hai thư mục chính:
*   `be-booking-homestay` (NestJS REST API Server)
*   `fe-booking-homestay` (Next.js Web Client)

```
                     [ Khách hàng / Quản trị viên ]
                                   │
                     (Giao tiếp HTTP / WebSockets)
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │               FRONTEND (Next.js)                 │
          └────────────────────────┬─────────────────────────┘
                                   │ (REST API / JSON)
                                   ▼
          ┌──────────────────────────────────────────────────┐
          │               BACKEND (NestJS)                   │
          └────────┬───────────────┬────────────────┬────────┘
                   │               │                │
                   ▼               ▼                ▼
             [MySQL / TiDB]    [PayOS API]    [Google Gemini]
             (Database chính)   (Thanh toán)   (RAG Embedding)
```

---

## 🌟 Các Tính Năng Nâng Cao Nổi Bật

### 1. Trợ lý ảo AI & Tìm kiếm ngữ nghĩa (AI RAG Chatbot)
*   **Gemini Embedding:** Hệ thống tự động chuyển đổi thông tin mô tả chi tiết của từng phòng homestay thành các vector đặc trưng đa chiều bằng model `gemini-embedding-2` và lưu vào bảng `room_embeddings`.
*   **Cosine Similarity:** Khi khách hàng đặt câu hỏi trong khung chat, backend chuyển đổi câu hỏi thành vector truy vấn và tính toán độ tương đồng Cosine trong in-memory (độ phức tạp $O(N)$) để tìm ra Top 5 phòng phù hợp nhất làm bối cảnh (Context).
*   **LLM Response:** Prompt hoàn chỉnh bao gồm (Câu hỏi + Context + Lịch sử chat) được gửi tới model `gemini-2.0-flash-lite` để xuất ra phản hồi tự nhiên, chính xác, hoàn toàn tránh hiện tượng ảo tưởng thông tin.
*   **Cơ chế Fallback:** Tự động bắt lỗi giới hạn hạn mức (Error 429) để chuyển đổi sang trả lời bằng các template tĩnh từ DB, đảm bảo chatbot luôn hoạt động 24/7.

### 2. Kiểm soát đồng thời chống đặt trùng phòng (Concurrency Control)
*   Áp dụng cơ chế **Pessimistic Locking** (`SELECT ... FOR UPDATE`) và giới hạn thời gian chờ khóa tối đa 3 giây (`SET innodb_lock_wait_timeout = 3`) bên trong Database Transaction để đồng bộ luồng đặt phòng song song.
*   Bảng `booking_date_locks` lưu trữ khóa ngày tạm thời với chỉ mục duy nhất (Unique Constraint) trên cặp `(roomId, date)`. Mọi giao dịch đặt trùng lịch vào cùng thời điểm sẽ bị database từ chối ngay lập tức ở tầng vật lý, tránh tình trạng Overbooking.

### 3. Tích hợp thanh toán QR PayOS an toàn
*   Khi khách hàng tạo yêu cầu thanh toán, hệ thống liên kết trực tiếp với cổng PayOS thông qua API tạo link QR chuyển khoản.
*   Backend cấu hình cổng Webhook tiếp nhận kết quả giao dịch tự động. Sử dụng cơ chế kiểm tra chữ ký (`payos.webhooks.verify`) mã hóa SHA256 để đảm bảo tính an toàn dữ liệu.
*   Áp dụng giải pháp **Idempotent** lồng trong Database Transaction để ngăn chặn lỗi cập nhật trùng lặp trạng thái đơn hàng khi PayOS gửi Webhook nhiều lần.

### 4. Tối ưu hóa SEO Blog nâng cao
*   Tích hợp giải pháp **Server-Side Rendering (SSR)** của Next.js sinh siêu dữ liệu động (**Dynamic Metadata**) dựa trên cơ sở dữ liệu bài viết thực tế cho phép các bot tìm kiếm (Google, Facebook) thu thập thông tin dễ dàng.
*   Tự động sinh tệp sitemap động XML tại đường dẫn `/sitemap.xml` và điều hướng bot crawler qua `/robots.txt`.

---

## 🧩 Danh Mục Công Nghệ Sử Dụng

### Backend (be-booking-homestay)
*   **Framework chính:** NestJS (v11.x)
*   **ORM kết nối DB:** Prisma ORM
*   **Cơ sở dữ liệu:** MySQL 8.x / Tương thích **TiDB (NewSQL)**
*   **Trí tuệ nhân tạo:** `@google/generative-ai` (Gemini SDK)
*   **Xác thực:** Passport-JWT (Access Token 1 ngày & Refresh Token 7 ngày)
*   **Mã hóa:** Bcrypt Hashing (Salt Rounds = 10)
*   **Thanh toán:** `@payos/node` (Cổng thanh toán PayOS)
*   **Gửi Mail SMTP:** Nodemailer
*   **Quản lý lịch trình:** `@nestjs/schedule` (Cron Jobs chạy ngầm quét đơn hàng quá hạn)

### Frontend (fe-booking-homestay)
*   **Framework chính:** Next.js (v16.x - App Router) & React (v19.x)
*   **Quản lý Style:** TailwindCSS v4
*   **Thư viện UI:** shadcn/ui & Radix UI
*   **Biểu đồ Admin:** Recharts
*   **Giao tiếp Realtime:** `socket.io-client`
*   **Trình soạn thảo văn bản:** Tiptap Editor (Dành cho viết bài viết Blog Admin)
*   **Bản đồ:** Leaflet & React-Leaflet (Nhúng bản đồ vị trí phòng homestay)

---

## 📥 Hướng Dẫn Cài Đặt & Triển Khai Nhanh

### Yêu cầu môi trường chuẩn bị trước:
*   Node.js phiên bản **>= 20**
*   NPM hoặc Yarn
*   MySQL Server **>= 8.0** chạy trên cổng mặc định (hoặc Docker MySQL)

---

### Bước 1: Clone dự án
```bash
git clone https://github.com/nguyenvuongviet/booking-4stay.git
cd booking-4stay
```

---

### Bước 2: Cài đặt và khởi chạy Backend (NestJS)

1.  **Di chuyển vào thư mục backend:**
    ```bash
    cd be-booking-homestay
    ```
2.  **Cài đặt các gói thư viện phụ thuộc:**
    ```bash
    npm install
    ```
3.  **Thiết lập tệp cấu hình môi trường:**
    Sao chép tệp mẫu sang `.env` và cập nhật các thông số (DATABASE_URL, API keys...):
    ```bash
    cp .env.example .env
    ```
4.  **Đồng bộ cấu trúc Database & Khởi tạo dữ liệu mẫu (Seeding):**
    ```bash
    # Chạy các migrations để tạo bảng trong database
    npx prisma migrate dev --name init
    
    # Tạo Prisma Client
    npx prisma generate
    
    # Thực hiện nạp dữ liệu mẫu vào DB (Bao gồm danh mục, tỉnh thành và phòng mẫu)
    npm run db:seed
    ```
    *Ghi chú:* Bạn cũng có thể import trực tiếp dữ liệu mẫu từ các file SQL tại thư mục `db/db_booking_homestay.sql` và `db/db_insert.sql`.
5.  **Khởi chạy Server ở môi trường Development:**
    ```bash
    npm run start:dev
    ```
    Backend API sẽ chạy tại địa chỉ: `http://localhost:3069`

---

### Bước 3: Cài đặt và khởi chạy Frontend (Next.js)

1.  **Di chuyển vào thư mục frontend từ thư mục gốc dự án:**
    ```bash
    cd ../fe-booking-homestay
    ```
2.  **Cài đặt các gói thư viện phụ thuộc:**
    ```bash
    npm install
    ```
3.  **Thiết lập tệp cấu hình môi trường:**
    Tạo tệp `.env.local` ở thư mục gốc của frontend:
    ```bash
    NEXT_PUBLIC_API_URL="http://localhost:3069/api"
    NEXT_PUBLIC_SOCKET_URL="http://localhost:3069"
    ```
4.  **Khởi chạy Client ở môi trường Development:**
    ```bash
    npm run dev
    ```
    Ứng dụng Web Client sẽ chạy tại địa chỉ: `http://localhost:3000`

---

## 🔗 Tài Liệu API (Swagger)

Backend của hệ thống tích hợp sẵn tài liệu tương tác API thông qua Swagger UI giúp quá trình phát triển và kiểm thử dễ dàng. Bạn truy cập vào địa chỉ sau khi Server backend đang hoạt động:

```
http://localhost:3069/api/docs
```
