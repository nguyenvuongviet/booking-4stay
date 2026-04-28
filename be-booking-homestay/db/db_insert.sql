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
INSERT IGNORE INTO `loyalty_program` (`userId`, `levelId`, `points`) VALUES (1, 4, 2400), (2, 1, 0), (3, 1, 0);

-- 6. Payment Methods
INSERT IGNORE INTO `payment_methods` (`id`, `name`, `description`, `isActive`) VALUES
(1, 'CASH', 'Thanh toán tiền mặt', 1),
(2, 'BANK_TRANSFER', 'Chuyển khoản ngân hàng', 1);

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
INSERT IGNORE INTO `rooms` (`id`, `hostId`, `provinceId`, `wardId`, `street`, `name`, `description`, `price`, `adultCapacity`, `childCapacity`, `latitude`, `longitude`) VALUES
(1, 3, 1, 1, '47 Nguyễn Thái Bình', '4Stay Central Saigon', 'Căn hộ ngay trung tâm Q1', 1200000.00, 2, 1, 10.7769, 106.7009),
(2, 3, 2, 2, '12 Hoàng Hoa Thám', '4Stay Hanoi View', 'Phòng đôi view Hồ Tây', 950000.00, 2, 0, 21.0285, 105.8542),
(3, 3, 3, 3, '5 Trần Hưng Đạo', '4Stay Da Nang Riverside', 'Phòng sát sông Hàn', 880000.00, 2, 1, 16.0544, 108.2022),
(4, 3, 1, 1, '22 Lê Lợi', 'Saigon Luxury Loft', 'Căn hộ kiểu loft sang trọng', 1500000.00, 3, 1, 10.7740, 106.7030),
(5, 3, 2, 2, '88 Thụy Khuê', 'Hanoi Old Quarter Home', 'Phòng ấm cúng trong phố cổ', 780000.00, 2, 1, 21.0340, 105.8500),
(6, 3, 3, 3, '19 Võ Văn Kiệt', 'Da Nang Beachfront', 'Phòng hướng biển Mỹ Khê', 1100000.00, 2, 1, 16.0610, 108.2480),
(7, 3, 1, 1, '10 Nguyễn Huệ', 'Saigon Walking Street Studio', 'Studio ngay phố đi bộ', 1350000.00, 2, 0, 10.7750, 106.7020),
(8, 3, 2, 2, '55 Nguyễn Trãi', 'Hanoi Cozy Apartment', 'Căn hộ mini trung tâm', 650000.00, 2, 1, 21.0260, 105.8430),
(9, 3, 3, 3, '77 Bạch Đằng', 'Da Nang River Suite', 'Suite cao cấp sông Hàn', 1600000.00, 3, 1, 16.0670, 108.2240),
(10, 3, 1, 1, '320 Lý Tự Trọng', 'Saigon City View', 'Phòng view thành phố tuyệt đẹp', 900000.00, 2, 1, 10.7780, 106.6980);

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

-- 12. Room Images
INSERT IGNORE INTO `room_images` (`id`, `roomId`, `imageUrl`, `isMain`, `position`, `createdAt`, `updatedAt`) VALUES
(1, 1, '4stay/rooms/4Stay Central Saigon/bequ4bfvubsiki7zredc', 1, 1, '2025-10-26 00:42:49', '2025-10-26 00:42:49'),
(2, 1, '4stay/rooms/4Stay Central Saigon/il7dpms6maysv6ffx9cw', 0, 2, '2025-10-26 00:42:49', '2025-10-26 00:42:49'),
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


-- 13. Bookings
INSERT IGNORE INTO `bookings` (`id`, `userId`, `roomId`, `guestFullName`, `guestEmail`, `guestPhoneNumber`, `checkIn`, `checkOut`, `adults`, `children`, `rawTotalPrice`, `totalPrice`, `paidAmount`, `status`, `paymentMethod`) VALUES
(1, 1, 1, 'Demo Customer', 'user@gmail.com', '0907654321', '2025-11-01', '2025-11-03', 2, 0, 2400000.00, 2400000.00, 2400000.00, 'CHECKED_OUT', 'BANK_TRANSFER');

-- 14. Reviews
INSERT IGNORE INTO `reviews` (`bookingId`, `userId`, `rating`, `comment`) VALUES (1, 2, 5.0, 'Tuyệt vời, sạch sẽ!');

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;