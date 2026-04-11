-- -------------------------------------------------------------
-- Database Seed Data for Booking Homestay (Optimized & Idempotent)
-- -------------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 1. Roles
INSERT IGNORE INTO `roles` (`id`, `name`, `description`, `isActive`) VALUES
(1, 'USER', 'Người dùng đặt phòng', 1),
(2, 'HOST', 'Chủ homestay quản lý phòng', 1),
(3, 'ADMIN', 'Quản trị hệ thống', 1);

-- 2. Users (Password: 123456)
INSERT IGNORE INTO `users` (`id`, `email`, `password`, `firstName`, `lastName`, `phoneNumber`, `isVerified`, `isActive`, `provider`, `avatar`) VALUES
(1, 'admin@gmail.com', '$2b$10$ch/gepo7MiSD7MCZ9PpW0uSI.upAxnfdSvrbMLmrtzhY7.tZ0fKj6', 'Admin', 'Vuong Viet', '0901234567', 1, 1, 'LOCAL', '4stay/avatars/j4slezbrbdehcomrhje8'),
(2, 'user@gmail.com', '$2b$10$ch/gepo7MiSD7MCZ9PpW0uSI.upAxnfdSvrbMLmrtzhY7.tZ0fKj6', 'Customer', 'Demo', '0907654321', 1, 1, 'LOCAL', '4stay/avatars/j4slezbrbdehcomrhje8'),
(3, 'host@gmail.com', '$2b$10$ch/gepo7MiSD7MCZ9PpW0uSI.upAxnfdSvrbMLmrtzhY7.tZ0fKj6', 'Host', 'Verified', '0900000000', 1, 1, 'LOCAL', '4stay/avatars/j4slezbrbdehcomrhje8');

-- 3. User Roles
INSERT IGNORE INTO `user_roles` (`userId`, `roleId`) VALUES (1, 1), (1, 3), (2, 1), (3, 1), (3, 2);

-- 4. Levels
INSERT IGNORE INTO `levels` (`id`, `name`, `minPoints`, `discountPercent`, `maxDiscountAmount`) VALUES
(1, 'BRONZE', 0, 0.00, 0.00),
(2, 'SILVER', 200, 5.00, 200000.00),
(3, 'GOLD', 500, 10.00, 500000.00),
(4, 'PLATINUM', 1000, 15.00, 1000000.00);

-- 5. Loyalty Program
INSERT IGNORE INTO `loyalty_program` (`userId`, `levelId`, `points`) VALUES (1, 1, 0), (2, 1, 0), (3, 1, 0);

-- 6. Payment Methods
INSERT IGNORE INTO `payment_methods` (`id`, `name`, `description`, `isActive`) VALUES
(1, 'CASH', 'Thanh toán tiền mặt', 1),
(2, 'VNPAY', 'Thanh toán qua VNPay', 1),
(3, 'BANK_TRANSFER', 'Chuyển khoản ngân hàng', 1);

-- 7. Amenities
INSERT IGNORE INTO `amenities` (`id`, `name`, `category`) VALUES
(1, 'Wifi', 'BASIC'), (2, 'Air Conditioner', 'BASIC'), (3, 'Heating', 'BASIC'),
(4, 'Television', 'BASIC'), (5, 'Refrigerator', 'BASIC'), (6, 'Kitchen', 'BASIC'),
(7, 'Washing Machine', 'BASIC'), (8, 'Shower', 'BATHROOM'), (9, 'Bath Tub', 'BATHROOM'),
(10, 'Wardrobe', 'BEDROOM'), (11, 'Desk', 'BEDROOM'), (12, 'Balcony', 'COMMON'),
(13, 'Parking', 'COMMON'), (14, 'Swimming Pool', 'COMMON'), (15, 'Gym', 'COMMON');

-- 8. Locations
INSERT IGNORE INTO `location_countries` (`id`, `name`, `code`) VALUES (1, 'Việt Nam', 'VN');

-- 9. Rooms
INSERT IGNORE INTO `rooms` (`id`, `hostId`, `provinceId`, `districtId`, `wardId`, `street`, `name`, `description`, `price`, `adultCapacity`, `childCapacity`) VALUES
(1, 3, 1, 1, 1, '47 Nguyễn Thái Bình', '4Stay Central Saigon', 'Căn hộ ngay trung tâm Q1', 1200000.00, 2, 1),
(2, 3, 2, 2, 2, '12 Hoàng Hoa Thám', '4Stay Hanoi View', 'Phòng đôi view Hồ Tây', 950000.00, 2, 0),
(3, 3, 3, 3, 3, '5 Trần Hưng Đạo', '4Stay Da Nang Riverside', 'Phòng sát sông Hàn', 880000.00, 2, 1),
(4, 3, 1, 1, 1, '22 Lê Lợi', 'Saigon Luxury Loft', 'Căn hộ kiểu loft sang trọng', 1500000.00, 3, 1),
(5, 3, 2, 2, 2, '88 Thụy Khuê', 'Hanoi Old Quarter Home', 'Phòng ấm cúng trong phố cổ', 780000.00, 2, 1),
(6, 3, 3, 3, 3, '19 Võ Văn Kiệt', 'Da Nang Beachfront', 'Phòng hướng biển Mỹ Khê', 1100000.00, 2, 1),
(7, 3, 1, 1, 1, '10 Nguyễn Huệ', 'Saigon Walking Street Studio', 'Studio ngay phố đi bộ', 1350000.00, 2, 0),
(8, 3, 2, 2, 2, '55 Nguyễn Trãi', 'Hanoi Cozy Apartment', 'Căn hộ mini trung tâm', 650000.00, 2, 1),
(9, 3, 3, 3, 3, '77 Bạch Đằng', 'Da Nang River Suite', 'Suite cao cấp sông Hàn', 1600000.00, 3, 1),
(10, 3, 1, 1, 1, '320 Lý Tự Trọng', 'Saigon City View', 'Phòng view thành phố tuyệt đẹp', 900000.00, 2, 1);

-- 10. Room Beds
INSERT IGNORE INTO `room_beds` (`roomId`, `type`, `quantity`) VALUES
(1, 'QUEEN', 1), (1, 'SOFA_BED', 1), (2, 'KING', 1), (3, 'DOUBLE', 1), (3, 'SINGLE', 1),
(4, 'KING', 1), (5, 'QUEEN', 1), (6, 'KING', 1), (7, 'QUEEN', 1), (8, 'DOUBLE', 1),
(9, 'KING', 2), (10, 'QUEEN', 1);

-- 11. Room Amenities
INSERT IGNORE INTO `room_amenities` (`roomId`, `amenityId`) VALUES
(1,1), (1,2), (1,5), (1,6), (1,8),
(2,1), (2,2), (2,4), (2,8),
(3,1), (3,2), (3,12), (3,13),
(4,1), (4,2), (4,15),
(5,1), (5,2), (5,10),
(6,1), (6,2), (6,8), (6,12),
(7,1), (7,2), (7,4),
(8,1), (8,2), (8,5),
(9,1), (9,2), (9,14),
(10,1), (10,2), (10,11);

-- 12. Bookings
INSERT IGNORE INTO `bookings` (`id`, `userId`, `roomId`, `guestFullName`, `guestEmail`, `guestPhoneNumber`, `checkIn`, `checkOut`, `adults`, `children`, `rawTotalPrice`, `totalPrice`, `status`, `paymentMethod`) VALUES
(1, 1, 1, 'Demo Customer', 'user@gmail.com', '0907654321', '2025-11-01', '2025-11-03', 2, 0, 2400000.00, 2400000.00, 'CHECKED_OUT', 'VNPAY');

-- 13. Reviews
INSERT IGNORE INTO `reviews` (`bookingId`, `userId`, `rating`, `comment`) VALUES (1, 2, 5.0, 'Tuyệt vời, sạch sẽ!');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;