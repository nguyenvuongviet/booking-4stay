# Booking 4Stay

Booking 4Stay là một nền tảng web giúp người dùng **tìm kiếm, đặt phòng homestay, khách sạn và căn hộ** một cách nhanh chóng, tiện lợi và thân thiện.  
Dự án được xây dựng theo kiến trúc **Next.js + Nest.js + MySQL** với thiết kế hiện đại và hiệu năng cao.

---

## Tính năng nổi bật

### Người dùng (Customer)
- Đăng ký, đăng nhập, đăng xuất.
- Tìm kiếm phòng theo **địa điểm, ngày, giá, số người**.
- Xem chi tiết phòng: hình ảnh, đánh giá, mô tả, tiện ích.
- Đặt phòng, hủy phòng (nếu được phép).
- Viết và xem **đánh giá (review)**.
- Lưu danh sách yêu thích (wishlist).

### Quản trị viên (Admin)
- Quản lý người dùng, phòng, đặt phòng.
- Xem thống kê doanh thu và lượt đặt.
- Quản lý phòng: thêm, chỉnh sửa, ẩn/hiện phòng.
- Xem danh sách đặt phòng của khách.
- Quản lý đánh giá từ khách hàng.

---

## Kiến trúc hệ thống

Frontend (Next.js + TailwindCSS)
   |
   |--> REST API (Nest.js)
   |
Backend (MySQL)

## Công nghệ sử dụng
| Thành phần   | Công nghệ                               |
| ------------ | --------------------------------------- |
| **Frontend** | Next.js, React, TailwindCSS, TypeScript |
| **UI/UX**    | shadcn/ui, Lucide Icons                 |
| **Backend**  | Nest.js, MySQL                  |
| **Auth**     | JWT                                     |
| **ORM**      | Prisma                                  |
| **Deploy**   | Vercel                                  |
