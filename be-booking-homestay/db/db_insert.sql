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

-- =========================================================================
-- PHẦN I: DỮ LIỆU CẦN THIẾT (SYSTEM CONFIGS & MASTER DATA)
-- Những dữ liệu cấu hình hệ thống cốt lõi để website hoạt động ổn định
-- =========================================================================

-- 1. Vai trò người dùng (Roles)
INSERT IGNORE INTO `roles` (`id`, `name`, `description`, `isActive`) VALUES
(1, 'USER', 'Người dùng đặt phòng', 1),
(2, 'HOST', 'Chủ homestay quản lý phòng', 1),
(3, 'ADMIN', 'Quản trị hệ thống', 1);

-- 2. Hạng thành viên thân thiết (Levels)
INSERT IGNORE INTO `levels` (`id`, `name`, `minPoints`, `discountPercent`, `maxDiscountAmount`) VALUES
(1, 'BRONZE', 0, 0.00, 0.00),
(2, 'SILVER', 10000, 5.00, 200000.00),
(3, 'GOLD', 50000, 10.00, 500000.00),
(4, 'PLATINUM', 100000, 15.00, 1000000.00);

-- 3. Phương thức thanh toán (Payment Methods)
INSERT IGNORE INTO `payment_methods` (`id`, `name`, `description`, `isActive`) VALUES
(1, 'CASH', 'Thanh toán tiền mặt', 1),
(2, 'BANK_TRANSFER', 'Chuyển khoản ngân hàng', 1);

-- 4. Tiện ích phòng (Amenities)
INSERT IGNORE INTO `amenities` (`id`, `name`, `category`) VALUES
(1, 'Wifi', 'BASIC'), (2, 'Air Conditioner', 'BASIC'), (3, 'Heating', 'BASIC'),
(4, 'Television', 'BASIC'), (5, 'Refrigerator', 'BASIC'), (6, 'Kitchen', 'BASIC'),
(7, 'Washing Machine', 'BASIC'), (8, 'Shower', 'BATHROOM'), (9, 'Bath Tub', 'BATHROOM'),
(10, 'Wardrobe', 'BEDROOM'), (11, 'Desk', 'BEDROOM'), (12, 'Balcony', 'COMMON'),
(13, 'Parking', 'COMMON'), (14, 'Swimming Pool', 'COMMON'), (15, 'Gym', 'COMMON');

-- 5. Quốc gia định vị (Location Countries)
INSERT IGNORE INTO `location_countries` (`id`, `name`, `code`) VALUES (1, 'Việt Nam', 'VN');

-- =========================================================================
-- PHẦN II: DỮ LIỆU MẪU (SAMPLE / MOCK DATA)
-- Những dữ liệu ảo để phục vụ quá trình demo, phát triển và chạy thử
-- =========================================================================

-- 6. Người dùng mẫu (Users - Mật khẩu đã được mã hóa: 123456)
INSERT IGNORE INTO `users` (`id`, `email`, `password`, `firstName`, `lastName`, `phoneNumber`, `isVerified`, `isActive`, `provider`, `avatar`, `createdAt`, `updatedAt`) VALUES
(1, 'admin@gmail.com', '$2b$10$ch/gepo7MiSD7MCZ9PpW0uSI.upAxnfdSvrbMLmrtzhY7.tZ0fKj6', 'Admin', 'Vuong Viet', '0901234567', 1, 1, 'LOCAL', '4stay/avatars/oded3zqugdzw6jfjuqkg', '2025-10-01 00:00:00', '2025-10-01 00:00:00'),
(2, 'user@gmail.com', '$2b$10$ch/gepo7MiSD7MCZ9PpW0uSI.upAxnfdSvrbMLmrtzhY7.tZ0fKj6', 'Customer', 'Demo', '0907654321', 1, 1, 'LOCAL', '4stay/avatars/b2jbdj5xok23ojomry56', '2025-10-02 00:00:00', '2025-10-02 00:00:00'),
(3, 'user2@gmail.com', '$2b$10$ch/gepo7MiSD7MCZ9PpW0uSI.upAxnfdSvrbMLmrtzhY7.tZ0fKj6', 'Nguyễn Văn', 'An', '0901111222', 1, 1, 'LOCAL', '4stay/avatars/b2jbdj5xok23ojomry56', '2025-10-03 00:00:00', '2025-10-03 00:00:00');

-- 7. Gán vai trò cho người dùng mẫu (User Roles)
INSERT IGNORE INTO `user_roles` (`userId`, `roleId`) VALUES 
(1, 3), 
(2, 1), 
(3, 1);

-- 8. Tích điểm thân thiết mẫu (Loyalty Program)
INSERT INTO `loyalty_program` (`userId`, `levelId`, `points`) VALUES 
(1, 4, 2400), 
(2, 3, 650), 
(3, 2, 320)
ON DUPLICATE KEY UPDATE `levelId` = VALUES(`levelId`), `points` = VALUES(`points`);

-- 9. Phòng mẫu (Rooms)
INSERT IGNORE INTO `rooms` (`id`, `hostId`, `provinceId`, `wardId`, `street`, `name`, `description`, `price`, `adultCapacity`, `childCapacity`, `latitude`, `longitude`, `createdAt`, `updatedAt`) VALUES
(1, 1, 28, 2631, '47 Nguyễn Thái Bình', '4Stay Central Saigon', 'Căn hộ ngay trung tâm Q1', 1200000.00, 2, 1, 10.7694452, 106.7005728, '2025-10-15 00:00:00', '2025-10-15 00:00:00'),
(2, 1, 1, 8, '12 Hoàng Hoa Thám', '4Stay Hanoi View', 'Phòng đôi view Hồ Tây', 950000.00, 2, 0, 21.0425013, 105.8159563, '2025-10-15 00:00:00', '2025-10-15 00:00:00'),
(3, 1, 21, 1860, '5 Trần Hưng Đạo', '4Stay Da Nang Riverside', 'Phòng sát sông Hàn', 880000.00, 2, 1, 16.0607904, 108.2303821, '2025-10-15 00:00:00', '2025-10-15 00:00:00'),
(4, 1, 28, 2631, '22 Lê Lợi', 'Saigon Luxury Loft', 'Căn hộ kiểu loft sang trọng', 1500000.00, 3, 1, 10.7726018, 106.6994504, '2025-10-15 00:00:00', '2025-10-15 00:00:00'),
(5, 1, 1, 8, '88 Thụy Khuê', 'Hanoi Old Quarter Home', 'Phòng ấm cúng trong phố cổ', 780000.00, 2, 1, 21.0417658, 105.8260564, '2025-10-15 00:00:00', '2025-10-15 00:00:00'),
(6, 1, 21, 1860, '19 Võ Văn Kiệt', 'Da Nang Beachfront', 'Phòng hướng biển Mỹ Khê', 1100000.00, 2, 1, 16.0631470, 108.2419488, '2025-10-15 00:00:00', '2025-10-15 00:00:00'),
(7, 1, 28, 2630, '10 Nguyễn Huệ', 'Saigon Walking Street Studio', 'Studio ngay phố đi bộ', 1350000.00, 2, 0, 10.7734609, 106.7040780, '2025-10-15 00:00:00', '2025-10-15 00:00:00'),
(8, 1, 1, 58, '55 Nguyễn Trãi', 'Hanoi Cozy Apartment', 'Căn hộ mini trung tâm', 650000.00, 2, 1, 20.9869283, 105.7970533, '2025-10-15 00:00:00', '2025-10-15 00:00:00'),
(9, 1, 21, 1856, '77 Bạch Đằng', 'Da Nang River Suite', 'Suite cao cấp sông Hàn', 1600000.00, 3, 1, 16.0738682, 108.2246250, '2025-10-15 00:00:00', '2025-10-15 00:00:00'),
(10, 1, 28, 2631, '320 Lý Tự Trọng', 'Saigon City View', 'Phòng view thành phố tuyệt đẹp', 900000.00, 2, 1, 10.7753297, 106.6985971, '2025-10-15 00:00:00', '2025-10-15 00:00:00');

-- 10. Giường ngủ mẫu trong phòng (Room Beds)
INSERT IGNORE INTO `room_beds` (`roomId`, `type`, `quantity`) VALUES
(1, 'QUEEN', 1), (1, 'SOFA_BED', 1), (2, 'KING', 1), (3, 'DOUBLE', 1), (3, 'SINGLE', 1),
(4, 'KING', 1), (5, 'QUEEN', 1), (6, 'KING', 1), (7, 'QUEEN', 1), (8, 'DOUBLE', 1),
(9, 'KING', 2), (10, 'QUEEN', 1);

-- 11. Áp dụng tiện ích mẫu cho phòng (Room Amenities)
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

-- 12. Ảnh phòng mẫu (Room Images)
INSERT IGNORE INTO `room_images` (`id`, `roomId`, `imageUrl`, `isMain`, `position`, `createdAt`, `updatedAt`) VALUES
(1, 1, '4stay/rooms/4Stay Central Saigon/bequ4bfvubsiki7zredc', 1, 1, '2025-10-26 00:42:49', '2025-10-26 00:42:49'),
(2, 1, '4stay/rooms/4Stay Central Saigon/xszxsgwtktrh2iw0abax', 0, 2, '2025-10-26 00:42:49', '2025-10-26 00:42:49'),
(3, 4, '4stay/rooms/Saigon Luxury Loft/rc7m8hcphjma2nenxdno', 1, 1, '2025-11-29 12:48:35', '2025-11-29 12:48:35'),
(4, 4, '4stay/rooms/Saigon Luxury Loft/jroulxfxuyqlmz1ocnbe', 0, 2, '2025-11-29 12:48:35', '2025-11-29 12:48:35'),
(5, 4, '4stay/rooms/Saigon Luxury Loft/a2fkpib2cjjii7rg0bmj', 0, 3, '2025-11-29 12:48:35', '2025-11-29 12:48:35'),
(6, 4, '4stay/rooms/Saigon Luxury Loft/ylwsvstewnpkzsxeziuv', 0, 4, '2025-11-29 12:48:35', '2025-11-29 12:48:35'),
(7, 4, '4stay/rooms/Saigon Luxury Loft/yvye2zuzuccryiokkqng', 0, 5, '2025-11-29 12:49:09', '2025-11-29 12:49:09'),
(8, 4, '4stay/rooms/Saigon Luxury Loft/clr0zxvyqbog4rd5gny2', 0, 6, '2025-11-29 12:49:09', '2025-11-29 12:49:09'),
(9, 4, '4stay/rooms/Saigon Luxury Loft/p6lb6h6mlmpbfi972rlc', 0, 7, '2025-11-29 12:49:09', '2025-11-29 12:49:09'),
(10, 4, '4stay/rooms/Saigon Luxury Loft/qd100w3yqnkywihyfxfp', 0, 8, '2025-11-29 12:49:09', '2025-11-29 12:49:09'),
(11, 4, '4stay/rooms/Saigon Luxury Loft/zzhtyme12syxyhiqc8ou', 0, 9, '2025-11-29 12:49:09', '2025-11-29 12:49:09'),
(12, 5, '4stay/rooms/Hanoi Old Quarter Home/jvbevpl6nqxrrlpuhbbk', 1, 1, '2025-11-29 12:50:04', '2025-11-29 12:50:04'),
(13, 5, '4stay/rooms/Hanoi Old Quarter Home/ntjxabatgtm58pn888nf', 0, 2, '2025-11-29 12:50:04', '2025-11-29 12:50:04'),
(14, 5, '4stay/rooms/Hanoi Old Quarter Home/uh6opvbjwum8kybnla8u', 0, 3, '2025-11-29 12:50:04', '2025-11-29 12:50:04'),
(15, 5, '4stay/rooms/Hanoi Old Quarter Home/iqejxjeqxcuiclvmekew', 0, 4, '2025-11-29 12:50:04', '2025-11-29 12:50:04'),
(16, 5, '4stay/rooms/Hanoi Old Quarter Home/as58uftgsqerliosx133', 0, 5, '2025-11-29 12:50:04', '2025-11-29 12:50:04'),
(17, 5, '4stay/rooms/Hanoi Old Quarter Home/awfsiykd5cakjmmuprtt', 0, 6, '2025-11-29 12:50:04', '2025-11-29 12:50:04'),
(18, 5, '4stay/rooms/Hanoi Old Quarter Home/dohkaaietadnaefxj8ry', 0, 7, '2025-11-29 12:50:04', '2025-11-29 12:50:04'),
(19, 8, '4stay/rooms/Hanoi Cozy Apartment/jry4y4xii632f7jliwty', 1, 1, '2025-11-29 12:50:27', '2025-11-29 12:50:27'),
(20, 8, '4stay/rooms/Hanoi Cozy Apartment/rfarm5wy6tvimdwyzk14', 0, 2, '2025-11-29 12:50:27', '2025-11-29 12:50:27'),
(21, 8, '4stay/rooms/Hanoi Cozy Apartment/ztkp1fvafmomk5t08l59', 0, 3, '2025-11-29 12:50:27', '2025-11-29 12:50:27'),
(22, 8, '4stay/rooms/Hanoi Cozy Apartment/ppadgrbcrjtcbtdeyx3m', 0, 4, '2025-11-29 12:50:27', '2025-11-29 12:50:27'),
(23, 8, '4stay/rooms/Hanoi Cozy Apartment/ct2yz9ebwhdtks9ksmn2', 0, 5, '2025-11-29 12:50:27', '2025-11-29 12:50:27'),
(24, 8, '4stay/rooms/Hanoi Cozy Apartment/cpmrhtacnmkshen3x64c', 0, 6, '2025-11-29 12:50:27', '2025-11-29 12:50:27'),
(25, 8, '4stay/rooms/Hanoi Cozy Apartment/ngws7vdz5qhekwjphwqr', 0, 7, '2025-11-29 12:50:27', '2025-11-29 12:50:27'),
(26, 10, '4stay/rooms/Saigon City View/nvcy9rak3ghyejyeqlsc', 1, 1, '2025-11-29 12:50:53', '2025-11-29 12:50:53'),
(27, 10, '4stay/rooms/Saigon City View/zk22hb8rbfu2dkis1gnw', 0, 2, '2025-11-29 12:50:53', '2025-11-29 12:50:53'),
(28, 10, '4stay/rooms/Saigon City View/rtkzvca5zg5qhqttnbbl', 0, 3, '2025-11-29 12:50:53', '2025-11-29 12:50:53'),
(29, 10, '4stay/rooms/Saigon City View/dupbnu7ch9htsla0bzlc', 0, 4, '2025-11-29 12:50:53', '2025-11-29 12:50:53'),
(30, 10, '4stay/rooms/Saigon City View/im7e79snavnzhkaj6qzy', 0, 5, '2025-11-29 12:50:53', '2025-11-29 12:50:53'),
(31, 10, '4stay/rooms/Saigon City View/xyvcohtfbqsrwxbuuc7q', 0, 6, '2025-11-29 12:50:53', '2025-11-29 12:50:53'),
(32, 10, '4stay/rooms/Saigon City View/gnylm8yvyqsv4gmjtsew', 0, 7, '2025-11-29 12:50:53', '2025-11-29 12:50:53'),
(33, 5, '4stay/rooms/Hanoi Old Quarter Home/lnsu9p9bdqmuvx1vvali', 0, 8, '2025-11-29 12:52:41', '2025-11-29 12:52:41'),
(34, 5, '4stay/rooms/Hanoi Old Quarter Home/afik99hy6zq3nljou166', 0, 9, '2025-11-29 12:52:41', '2025-11-29 12:52:41'),
(35, 5, '4stay/rooms/Hanoi Old Quarter Home/jfd9zdpe6xgt42xb645j', 0, 10, '2025-11-29 12:52:41', '2025-11-29 12:52:41'),
(36, 5, '4stay/rooms/Hanoi Old Quarter Home/zehslxqglekuwplx59kf', 0, 11, '2025-11-29 12:52:41', '2025-11-29 12:52:41'),
(37, 5, '4stay/rooms/Hanoi Old Quarter Home/u06zehzme52sf9jq16p6', 0, 12, '2025-11-29 12:52:41', '2025-11-29 12:52:41'),
(38, 5, '4stay/rooms/Hanoi Old Quarter Home/ettyiygyhenk56hpenpm', 0, 13, '2025-11-29 12:52:41', '2025-11-29 12:52:41'),
(39, 5, '4stay/rooms/Hanoi Old Quarter Home/vl8xtk6bfcwbmyxi9k7d', 0, 14, '2025-11-29 12:52:41', '2025-11-29 12:52:41'),
(40, 6, '4stay/rooms/Da Nang Beachfront/zbjebnhiwxcr9f3hz530', 1, 1, '2025-11-29 12:53:19', '2025-11-29 12:53:19'),
(41, 6, '4stay/rooms/Da Nang Beachfront/enrkamy3h5hqpqmmw8lp', 0, 2, '2025-11-29 12:53:19', '2025-11-29 12:53:19'),
(42, 6, '4stay/rooms/Da Nang Beachfront/dov8aa8xghlekizgrx1d', 0, 3, '2025-11-29 12:53:19', '2025-11-29 12:53:19'),
(43, 6, '4stay/rooms/Da Nang Beachfront/ppggn9zd7uomjvqdfuh0', 0, 4, '2025-11-29 12:53:19', '2025-11-29 12:53:19'),
(44, 6, '4stay/rooms/Da Nang Beachfront/juzsendxgfixu4bpuspf', 0, 5, '2025-11-29 12:53:19', '2025-11-29 12:53:19'),
(45, 6, '4stay/rooms/Da Nang Beachfront/erxairvmvdlimamkdomj', 0, 6, '2025-11-29 12:53:19', '2025-11-29 12:53:19'),
(46, 6, '4stay/rooms/Da Nang Beachfront/cococj6kgnjsd2truoul', 0, 7, '2025-11-29 12:53:19', '2025-11-29 12:53:19'),
(47, 7, '4stay/rooms/Saigon Walking Street Studio/ebbhok1rimpswepdt79y', 1, 1, '2025-11-29 12:53:39', '2025-11-29 12:53:39'),
(48, 7, '4stay/rooms/Saigon Walking Street Studio/ss7ikr9mtraeueufxbbf', 0, 2, '2025-11-29 12:53:39', '2025-11-29 12:53:39'),
(49, 7, '4stay/rooms/Saigon Walking Street Studio/lbwqxn5fgnwyryavrkdh', 0, 3, '2025-11-29 12:53:39', '2025-11-29 12:53:39'),
(50, 7, '4stay/rooms/Saigon Walking Street Studio/kenzbdlltxb9zmoyirwy', 0, 4, '2025-11-29 12:53:39', '2025-11-29 12:53:39'),
(51, 7, '4stay/rooms/Saigon Walking Street Studio/pwkv2bcns2r8tuj42bum', 0, 5, '2025-11-29 12:53:39', '2025-11-29 12:53:39'),
(52, 7, '4stay/rooms/Saigon Walking Street Studio/no94nkuvygevogvzry4y', 0, 6, '2025-11-29 12:53:39', '2025-11-29 12:53:39'),
(53, 7, '4stay/rooms/Saigon Walking Street Studio/axotjy4xbisyi8rldl6s', 0, 7, '2025-11-29 12:53:39', '2025-11-29 12:53:39'),
(54, 3, '4stay/rooms/4Stay Da Nang Riverside/gsvspho7nlk9fdqgx7pu', 1, 1, '2025-11-29 12:54:41', '2025-11-29 12:54:41'),
(55, 3, '4stay/rooms/4Stay Da Nang Riverside/n9vtsflou5kvdw8qvqct', 0, 2, '2025-11-29 12:54:41', '2025-11-29 12:54:41'),
(56, 3, '4stay/rooms/4Stay Da Nang Riverside/v49ipm9zdusvexpsarul', 0, 3, '2025-11-29 12:54:41', '2025-11-29 12:54:41'),
(57, 3, '4stay/rooms/4Stay Da Nang Riverside/esjvvamaagb38whrc2he', 0, 4, '2025-11-29 12:54:41', '2025-11-29 12:54:41'),
(58, 3, '4stay/rooms/4Stay Da Nang Riverside/ybkvruudvqwtxp14eakd', 0, 5, '2025-11-29 12:54:41', '2025-11-29 12:54:41'),
(59, 3, '4stay/rooms/4Stay Da Nang Riverside/fdftn0adbvxihwiz2rgj', 0, 6, '2025-11-29 12:54:41', '2025-11-29 12:54:41'),
(60, 3, '4stay/rooms/4Stay Da Nang Riverside/jv2b34r4t3zdnjn7vnz4', 0, 7, '2025-11-29 12:54:41', '2025-11-29 12:54:41'),
(61, 2, '4stay/rooms/4Stay Hanoi View/dz5ujhxdtm1a3xlnezvj', 1, 1, '2025-11-29 12:54:52', '2025-11-29 12:54:52'),
(62, 2, '4stay/rooms/4Stay Hanoi View/alocjo3kxpdtoawbx9ul', 0, 2, '2025-11-29 12:54:52', '2025-11-29 12:54:52'),
(63, 2, '4stay/rooms/4Stay Hanoi View/dhhnsmnm1ymqnryoz7mw', 0, 3, '2025-11-29 12:54:52', '2025-11-29 12:54:52'),
(64, 2, '4stay/rooms/4Stay Hanoi View/ggjl12wf8ufvmsplacmf', 0, 4, '2025-11-29 12:54:52', '2025-11-29 12:54:52'),
(65, 2, '4stay/rooms/4Stay Hanoi View/ykbrwcqjzvsxc72x8f1p', 0, 5, '2025-11-29 12:54:52', '2025-11-29 12:54:52'),
(66, 2, '4stay/rooms/4Stay Hanoi View/qxpjwqbayd4cz1afhslt', 0, 6, '2025-11-29 12:54:52', '2025-11-29 12:54:52'),
(67, 2, '4stay/rooms/4Stay Hanoi View/amyzr0n0kk5didl9qrlz', 0, 7, '2025-11-29 12:54:52', '2025-11-29 12:54:52'),
(68, 9, '4stay/rooms/Da Nang River Suite/fmsl90zqc0zz4sk3gori', 1, 1, '2025-11-29 12:55:04', '2025-11-29 12:55:04'),
(69, 9, '4stay/rooms/Da Nang River Suite/vhyyiifre9wojcugwhiz', 0, 2, '2025-11-29 12:55:04', '2025-11-29 12:55:04'),
(70, 9, '4stay/rooms/Da Nang River Suite/qcxy3gpxy0zu2fcw15ak', 0, 3, '2025-11-29 12:55:04', '2025-11-29 12:55:04'),
(71, 9, '4stay/rooms/Da Nang River Suite/h7cte2fxpkpvhzdpwzoo', 0, 4, '2025-11-29 12:55:04', '2025-11-29 12:55:04'),
(72, 9, '4stay/rooms/Da Nang River Suite/tenjoz4eqvrbnhbbtzke', 0, 5, '2025-11-29 12:55:04', '2025-11-29 12:55:04'),
(73, 9, '4stay/rooms/Da Nang River Suite/rw975vqazc2b1omopkhg', 0, 6, '2025-11-29 12:55:04', '2025-11-29 12:55:04'),
(74, 9, '4stay/rooms/Da Nang River Suite/jaw7nd8osogc8bwmrtn9', 0, 7, '2025-11-29 12:55:04', '2025-11-29 12:55:04');

-- 13. Đơn đặt phòng mẫu (Bookings)
INSERT IGNORE INTO `bookings` (`id`, `userId`, `roomId`, `guestFullName`, `guestEmail`, `guestPhoneNumber`, `checkIn`, `checkOut`, `adults`, `children`, `rawTotalPrice`, `totalPrice`, `paidAmount`, `status`, `paymentMethod`, `createdAt`, `updatedAt`) VALUES
-- Khách hàng user@gmail.com (ID 2): Đặt phòng 1, 3, 4, 5, 6, 7, 8 để có lịch sử phong phú
(1, 2, 1, 'Demo Customer', 'user@gmail.com', '0907654321', '2025-11-01', '2025-11-03', 2, 0, 2400000.00, 2400000.00, 2400000.00, 'CHECKED_OUT', 'BANK_TRANSFER', '2025-10-25 14:00:00', '2025-11-03 14:00:00'),
(2, 2, 4, 'Demo Customer', 'user@gmail.com', '0907654321', '2026-07-04', '2026-07-07', 2, 1, 3000000.00, 3000000.00, 3000000.00, 'CHECKED_IN', 'CASH', '2026-06-28 09:30:00', '2026-07-04 14:00:00'),
(3, 2, 5, 'Demo Customer', 'user@gmail.com', '0907654321', '2026-07-10', '2026-07-13', 2, 0, 1560000.00, 1560000.00, 1560000.00, 'CONFIRMED', 'CASH', '2026-06-25 15:20:00', '2026-06-25 15:30:00'),
(6, 2, 1, 'Demo Customer', 'user@gmail.com', '0907654321', '2026-06-10', '2026-06-12', 2, 0, 2400000.00, 2400000.00, 2400000.00, 'CHECKED_OUT', 'BANK_TRANSFER', '2026-06-02 16:45:00', '2026-06-12 14:00:00'),
(7, 2, 4, 'Demo Customer', 'user@gmail.com', '0907654321', '2026-06-20', '2026-06-22', 2, 0, 3000000.00, 3000000.00, 3000000.00, 'CHECKED_OUT', 'BANK_TRANSFER', '2026-06-15 10:00:00', '2026-06-22 14:00:00'),
(8, 2, 3, 'Demo Customer', 'user@gmail.com', '0907654321', '2026-06-01', '2026-06-05', 2, 1, 3520000.00, 3520000.00, 3520000.00, 'CHECKED_OUT', 'BANK_TRANSFER', '2026-05-20 14:30:00', '2026-06-05 14:00:00'),
(9, 2, 7, 'Demo Customer', 'user@gmail.com', '0907654321', '2026-07-15', '2026-07-18', 2, 0, 2700000.00, 2700000.00, 2700000.00, 'CONFIRMED', 'BANK_TRANSFER', '2026-07-02 09:00:00', '2026-07-02 09:15:00'),
(10, 2, 2, 'Demo Customer', 'user@gmail.com', '0907654321', '2026-07-06', '2026-07-08', 2, 0, 1900000.00, 1900000.00, 0.00, 'CONFIRMED', 'BANK_TRANSFER', '2026-07-05 10:00:00', '2026-07-05 10:00:00'),

-- Khách hàng user2@gmail.com (ID 3): Đặt ít hơn để test chuyển đổi tài khoản
(4, 3, 2, 'Nguyễn Văn An', 'user2@gmail.com', '0901111222', '2026-05-10', '2026-05-12', 2, 0, 1900000.00, 1900000.00, 1900000.00, 'CHECKED_OUT', 'BANK_TRANSFER', '2026-05-01 10:15:00', '2026-05-12 14:00:00'),
(5, 3, 6, 'Nguyễn Văn An', 'user2@gmail.com', '0901111222', '2026-07-08', '2026-07-11', 2, 1, 3300000.00, 3300000.00, 3300000.00, 'CONFIRMED', 'BANK_TRANSFER', '2026-07-01 11:00:00', '2026-07-01 11:15:00');

-- 14. Đánh giá mẫu (Reviews)
INSERT IGNORE INTO `reviews` (`bookingId`, `userId`, `rating`, `comment`, `createdAt`, `updatedAt`) VALUES 
(1, 2, 5.0, 'Tuyệt vời, sạch sẽ!', '2025-11-03 15:00:00', '2025-11-03 15:00:00'),
(4, 3, 4.5, 'Căn hộ rất đẹp, view Hồ Tây thoáng mát. Sẽ quay lại!', '2026-05-12 16:30:00', '2026-05-12 16:30:00');

-- 15. Danh mục bài viết mẫu (Blog Categories)
INSERT IGNORE INTO `blog_categories` (`id`, `name`, `slug`, `description`, `position`, `isActive`) VALUES
(1, 'Cẩm nang du lịch', 'cam-nang-du-lich', 'Cẩm nang hướng dẫn du lịch tự túc từ A-Z', 1, 1),
(2, 'Ẩm thực', 'am-thuc', 'Khám phá ẩm thực độc đáo tại các homestay', 2, 1),
(3, 'Review Homestay', 'review-homestay', 'Đánh giá chân thực các căn homestay nổi bật', 3, 1),
(4, 'Kinh nghiệm đặt phòng', 'kinh-nghiem-dat-phong', 'Mẹo săn deal tốt, tránh lừa đảo khi đặt phòng', 4, 1),
(5, 'Sự kiện & Lễ hội', 'su-kien-le-hoi', 'Các lễ hội văn hóa đặc sắc tại địa phương', 5, 1);

-- 16. Thẻ bài viết mẫu (Blog Tags)
INSERT IGNORE INTO `blog_tags` (`id`, `name`, `slug`) VALUES
(1, 'Đà Lạt', 'da-lat'),
(2, 'Hà Nội', 'ha-noi'),
(3, 'Đà Nẵng', 'da-nang'),
(4, 'Sài Gòn', 'sai-gon'),
(5, 'Review', 'review'),
(6, 'Ẩm thực đường phố', 'am-thuc-duong-pho'),
(7, 'Homestay Đẹp', 'homestay-dep');

-- 17. Bài viết mẫu (Blog Posts)
INSERT IGNORE INTO `blog_posts` (`id`, `categoryId`, `authorId`, `provinceId`, `title`, `slug`, `excerpt`, `content`, `thumbnailUrl`, `metaTitle`, `metaDescription`, `metaKeywords`, `status`, `isFeatured`, `viewCount`, `readingTime`, `publishedAt`) VALUES
(1, 1, 1, 28, 'Top 5 món ăn lề đường phải thử khi ghé thăm Sài Gòn', 'top-5-mon-an-le-duong-phai-thu-khi-ghe-tham-sai-gon', 'Sài Gòn không chỉ nổi tiếng với những tòa nhà chọc trời mà còn có nền ẩm thực đường phố vô cùng đa dạng. Cùng 4Stay khám phá top 5 món ngon đường phố không thể bỏ lỡ tại TPHCM.', '<h2>Sài Gòn - Thiên đường ẩm thực đường phố</h2><p>Nếu bạn lần đầu đến Sài Gòn, hãy chuẩn bị một chiếc bụng đói vì ẩm thực nơi đây sẽ khiến bạn mê mẩn. Từ bánh mì Huỳnh Hoa nổi tiếng đến hủ tiếu gõ lề đường, mỗi món ăn đều mang hương vị rất riêng.</p><h3>1. Cơm tấm Sài Gòn</h3><p>Món ăn huyền thoại có thể ăn từ sáng đến tối muộn. Hạt cơm tấm tơi xốp ăn kèm sườn nướng thơm phức, bì chả và nước mắm chua ngọt sệt sệt đặc trưng.</p><h3>2. Bánh tráng trộn</h3><p>Món ăn vặt quốc dân của giới trẻ Sài Thành. Bánh tráng cắt nhỏ trộn đều cùng muối tôm, tắc, trứng cút, khô bò, xoài xanh và rau răm.</p><p>Đặt phòng tại <strong>4Stay Central Saigon</strong> để thuận tiện đi bộ khám phá các phố ẩm thực sầm uất tại Quận 1 nhé!</p>', 'https://res.cloudinary.com/nguyenvuongviet/image/upload/v1779777922/4stay/blogs/qysrhyrbaxbd63ehhbru.png', 'Top 5 ẩm thực đường phố Sài Gòn không thể bỏ qua | 4Stay', 'Khám phá danh sách các món ăn đường phố ngon nhất tại TPHCM cùng kinh nghiệm đi lại chi tiết từ 4Stay.', 'ẩm thực sài gòn, ăn vặt quận 1, du lịch tphcm, cơm tấm sài gòn', 'PUBLISHED', 1, 142, 5, '2026-05-24 15:00:00'),
(2, 3, 1, 1, 'Review chi tiết căn hộ 4Stay Hanoi View ven Hồ Tây', 'review-chi-tiet-can-ho-4stay-hanoi-view-ven-ho-tay', 'Bạn đang tìm kiếm một không gian yên bình ven Hồ Tây cho chuyến đi Hà Nội sắp tới? Hãy xem bài review chi tiết về tiện ích, không gian và trải nghiệm tại 4Stay Hanoi View nhé.', '<h2>Trải nghiệm yên bình giữa lòng thủ đô</h2><p>Hà Nội có những ngày rất vội vã, nhưng khi bạn bước vào <strong>4Stay Hanoi View</strong>, mọi ồn ào dường như lùi lại phía sau. Tọa lạc trên đường Hoàng Hoa Thám, căn hộ sở hữu ban công rộng lớn hướng thẳng ra mặt nước Hồ Tây thơ mộng.</p><h3>Thiết kế và Tiện ích</h3><p>Căn hộ được thiết kế theo phong cách tối giản Nhật Bản với tông màu gỗ ấm áp. Giường ngủ cỡ King siêu êm ái cùng hệ cửa kính chạm trần giúp bạn đón ánh bình minh mỗi sáng sớm.</p><p>Từ homestay, bạn chỉ mất 5 phút đi bộ ra bờ hồ và thưởng thức cà phê trứng truyền thống hoặc kem Hồ Tây lộng gió.</p>', 'https://res.cloudinary.com/nguyenvuongviet/image/upload/v1783239085/4stay/blogs/rl9wyrmqz99v5hmygoov.jpg', 'Review căn hộ 4Stay Hanoi View bên bờ Hồ Tây thơ mộng', 'Đánh giá chân thực homestay 4Stay Hanoi View: Vị trí đắc địa, view ngắm trọn hoàng hôn Hồ Tây cực chill.', 'homestay hồ tây, review 4stay hanoi view, homestay hà nội đẹp', 'PUBLISHED', 0, 89, 4, '2026-05-24 15:05:00'),
(3, 4, 1, 21, 'Kinh nghiệm đặt homestay Đà Nẵng giá rẻ, tránh bẫy mùa cao điểm', 'kinh-nghiem-dat-homestay-da-nang-gia-re-tranh-bay-mua-cao-diem', 'Đà Nẵng đang bước vào mùa du lịch cao điểm. Để tránh tình trạng cháy phòng hoặc thuê phải phòng kém chất lượng với giá cắt cổ, bỏ túi ngay những mẹo vàng đặt phòng homestay từ 4Stay.', '<h2>Lên kế hoạch đặt phòng thông minh tại Đà Nẵng</h2><p>Đà Nẵng là thành phố đáng sống nhất Việt Nam và luôn thu hút hàng triệu lượt khách mỗi mùa hè. Nhu cầu đặt phòng tăng đột biến dẫn đến việc nhiều cơ sở nâng giá vô tội vạ.</p><h3>1. Hãy đặt trước ít nhất 3 tuần</h3><p>Việc đặt phòng sớm không chỉ giúp bạn giữ được căn phòng ưng ý mà còn được hưởng mức giá ưu đãi từ các hệ thống lớn.</p><h3>2. Lựa chọn các căn homestay gần sông Hàn hoặc gần biển Mỹ Khê</h3><p>Nếu bạn thích sự nhộn nhịp ban đêm và ngắm cầu rồng phun lửa, hãy chọn khu vực sông Hàn như căn <strong>4Stay Da Nang Riverside</strong>. Nếu thích tắm biển đón bình minh, khu vực Mỹ Khê là lựa chọn hoàn hảo.</p>', 'https://res.cloudinary.com/nguyenvuongviet/image/upload/v1779777874/4stay/blogs/zypi6d613moztrsyjgsr.png', 'Kinh nghiệm đặt phòng homestay Đà Nẵng chất lượng giá tốt | 4Stay', 'Mẹo săn phòng homestay Đà Nẵng giá rẻ dịp hè, phân tích ưu nhược điểm khu vực ven sông Hàn và ven biển.', 'kinh nghiệm đặt phòng đà nẵng, homestay đà nẵng gần biển, du lịch đà nẵng', 'PUBLISHED', 1, 210, 6, '2026-05-24 15:10:00');

-- 18. Gắn thẻ bài viết mẫu (Blog Post Tags)
INSERT IGNORE INTO `blog_post_tags` (`postId`, `tagId`) VALUES
(1, 4), (1, 6), (2, 2), (2, 5), (2, 7), (3, 3), (3, 5);

-- 19. Bình luận bài viết mẫu (Blog Comments)
INSERT IGNORE INTO `blog_comments` (`id`, `postId`, `userId`, `content`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2, 'Bánh mì Huỳnh Hoa ăn siêu ngon nhưng hơi nhiều bơ, ai sợ béo nên cân nhắc nhé!', 'APPROVED', '2026-05-25 10:00:00', '2026-05-25 10:00:00'),
(2, 1, 2, 'Cơm tấm sườn bì chả ở Sài Gòn đúng là đỉnh nhất, ăn hoài không chán.', 'APPROVED', '2026-05-25 10:15:00', '2026-05-25 10:15:00'),
(3, 2, 2, 'Vừa ở đây tuần trước, view ban công Hồ Tây buổi chiều ngắm hoàng hôn đỉnh thực sự!', 'APPROVED', '2026-05-25 11:00:00', '2026-05-25 11:00:00');

-- 20. Chương trình khuyến mãi mẫu (Promotions)
INSERT IGNORE INTO `promotions` (`id`, `code`, `name`, `promotionType`, `discountType`, `discountValue`, `maxDiscount`, `minOrderValue`, `provinceId`, `targetLevelId`, `usageLimit`, `usedCount`, `perUserLimit`, `startDate`, `endDate`, `isPublic`, `isActive`, `isDeleted`) VALUES
(1, 'WELCOME10', 'Ưu đãi chào mừng thành viên mới', 'WELCOME', 'PERCENTAGE', 10.00, 150000.00, 0.00, NULL, NULL, 1000, 0, 1, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 1, 1, 0),
(2, 'SUMMER2026', 'Chào hè rực rỡ - Giảm giá homestay', 'SEASONAL', 'FIXED_AMOUNT', 200000.00, NULL, 1500000.00, NULL, NULL, 500, 0, 1, '2026-06-01 00:00:00', '2026-08-31 23:59:59', 1, 1, 0),
(3, 'SAIGONSPECIAL', 'Trải nghiệm homestay Sài Gòn sôi động', 'BLOG', 'PERCENTAGE', 12.00, 200000.00, 500000.00, 28, NULL, 300, 0, 1, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, 1, 0),
(4, 'GOLDMEMBER', 'Ưu đãi đặc quyền hạng Vàng', 'LOYALTY', 'PERCENTAGE', 15.00, 500000.00, 1000000.00, NULL, 3, 200, 0, 2, '2026-01-01 00:00:00', '2026-12-31 23:59:59', 1, 1, 0),
(5, 'THANKYOU', 'Cảm ơn bạn đã lựa chọn 4Stay', 'THANKYOU', 'FIXED_AMOUNT', 100000.00, NULL, 500000.00, NULL, NULL, 10000, 0, 1, '2026-01-01 00:00:00', '2027-12-31 23:59:59', 0, 1, 0);

-- 21. Liên kết Khuyến mãi và Bài viết mẫu (Blog Promotions)
INSERT IGNORE INTO `blog_promotions` (`id`, `postId`, `promotionId`) VALUES
(1, 1, 3);

-- 22. Voucher người dùng thu thập mẫu (User Vouchers)
INSERT IGNORE INTO `user_vouchers` (`id`, `userId`, `promotionId`, `status`, `collectedAt`) VALUES
(1, 2, 1, 'AVAILABLE', '2026-06-01 10:00:00'),
(2, 2, 2, 'AVAILABLE', '2026-06-01 11:00:00'),
(3, 3, 1, 'AVAILABLE', '2026-06-02 10:00:00'),
(4, 4, 2, 'AVAILABLE', '2026-06-02 11:00:00');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;