-- -------------------------------------------------------------
-- TablePlus 6.7.1(636)
--
-- https://tableplus.com/
--
-- Database: db_booking_homestay
-- Generation Time: 2025-10-25 00:00:34.6260
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

INSERT INTO `roles` (`id`, `name`, `description`, `isActive`, `deletedBy`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 'USER', 'Người dùng đặt phòng', 1, 0, 0, NULL, '2025-10-02 09:46:12', '2025-10-02 09:46:12'),
(2, 'HOST', 'Chủ homestay quản lý phòng', 0, 0, 0, NULL, '2025-10-02 09:46:12', '2025-10-02 09:46:12'),
(3, 'ADMIN', 'Quản trị hệ thống', 1, 0, 0, NULL, '2025-10-02 09:46:12', '2025-10-02 09:46:12');

INSERT INTO `users` (`id`, `email`,`password`,`firstName`,`lastName`,`phoneNumber`,`country`,`isVerified`,`isActive`)
VALUES
(1,'admin@gmail.com','$2b$10$ch/gepo7MiSD7MCZ9PpW0uSI.upAxnfdSvrbMLmrtzhY7.tZ0fKj6','admin','vieet','0901234567','Vietnam',1,1);

INSERT INTO `user_roles` (`id`, `userId`, `roleId`) VALUES
(1, 1, 3);

INSERT INTO `otp_codes` (`id`, `userId`, `email`, `otp`, `expiresAt`, `isUsed`, `deletedBy`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'admin@gmail.com', '318062', '2025-10-02 10:46:39', 1, 0, 0, NULL, '2025-10-02 10:41:39', '2025-10-02 10:41:56');

INSERT INTO `levels` (`id`, `name`, `minPoints`, `description`, `isActive`, `deletedBy`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 'BRONZE', 0, 'Cấp độ cơ bản', 1, 0, 0, NULL, '2025-10-02 09:46:12', '2025-10-06 04:10:20'),
(2, 'PLATINU', 1001, 'Khách hàng cao cấp', 1, 0, 0, NULL, '2025-10-02 09:46:12', '2025-10-04 12:03:03'),
(3, 'GOLD', 500, 'Khách hàng VIP', 1, 0, 0, NULL, '2025-10-02 09:46:12', '2025-10-02 09:46:12'),
(4, 'PLATINUM', 1000, 'Khách hàng cao cấp', 1, 0, 0, NULL, '2025-10-02 09:46:12', '2025-10-02 09:46:12');

INSERT INTO `amenities` (`id`, `name`, `description`, `category`, `deletedBy`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 'Wifi', 'Internet tốc độ cao', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(2, 'Air Conditioner', 'Điều hòa nhiệt độ', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(3, 'Heating', 'Máy sưởi', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(4, 'Television', 'TV màn hình phẳng', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(5, 'Refrigerator', 'Tủ lạnh', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(6, 'Microwave', 'Lò vi sóng', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(7, 'Kitchen', 'Khu bếp riêng', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(8, 'Washing Machine', 'Máy giặt', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(9, 'Iron', 'Bàn ủi', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(10, 'Hair Dryer', 'Máy sấy tóc', 'BASIC', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(11, 'Shower', 'Vòi sen', 'BATHROOM', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(12, 'Bath Tub', 'Bồn tắm', 'BATHROOM', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(13, 'Toiletries', 'Đồ vệ sinh cá nhân miễn phí', 'BATHROOM', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(14, 'Toilet Paper', 'Giấy vệ sinh', 'BATHROOM', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(15, 'Wardrobe', 'Tủ quần áo', 'BEDROOM', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(16, 'Desk', 'Bàn làm việc', 'BEDROOM', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(17, 'Sofa Bed', 'Ghế sofa giường', 'BEDROOM', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(18, 'Balcony', 'Ban công riêng', 'COMMON', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(19, 'Parking', 'Bãi đỗ xe', 'COMMON', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(20, 'Elevator', 'Thang máy', 'COMMON', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(21, 'Swimming Pool', 'Hồ bơi', 'COMMON', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(22, 'Gym', 'Phòng tập thể dục', 'COMMON', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(23, 'Breakfast', 'Bữa sáng miễn phí', 'COMMON', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(24, 'Coffee Maker', 'Máy pha cà phê', 'COMMON', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(25, 'Fan', 'Quạt máy', 'COMMON', 0, 0, NULL, '2025-10-02 09:46:13', '2025-10-02 09:46:13');

INSERT INTO `payment_methods` (`id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'CASH', 'Thanh toán tiền mặt', 1, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(2, 'CREDIT_CARD', 'Thanh toán bằng thẻ tín dụng', 1, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(3, 'PAYPAL', 'Thanh toán qua PayPal', 1, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(4, 'MOMO', 'Thanh toán qua ví MoMo', 1, '2025-10-02 09:46:13', '2025-10-02 09:46:13'),
(5, 'VNPAY', 'Thanh toán qua VNPay', 1, '2025-10-02 09:46:13', '2025-10-02 09:46:13');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;