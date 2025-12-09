-- -------------------------------------------------------------
-- TablePlus 6.7.4(642)
--
-- https://tableplus.com/
--
-- Database: db_booking_homestay
-- Generation Time: 2025-11-30 13:05:06.4000
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


INSERT INTO `amenities` (`id`, `name`, `description`, `category`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 'Wifi', 'Internet tốc độ cao', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(2, 'Air Conditioner', 'Điều hòa nhiệt độ', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(3, 'Heating', 'Máy sưởi', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(4, 'Television', 'TV màn hình phẳng', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(5, 'Refrigerator', 'Tủ lạnh', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(6, 'Microwave', 'Lò vi sóng', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(7, 'Kitchen', 'Khu bếp riêng', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(8, 'Washing Machine', 'Máy giặt', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(9, 'Iron', 'Bàn ủi', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(10, 'Hair Dryer', 'Máy sấy tóc', 'BASIC', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(11, 'Shower', 'Vòi sen', 'BATHROOM', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(12, 'Bath Tub', 'Bồn tắm', 'BATHROOM', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(13, 'Toiletries', 'Đồ vệ sinh cá nhân miễn phí', 'BATHROOM', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(14, 'Toilet Paper', 'Giấy vệ sinh', 'BATHROOM', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(15, 'Wardrobe', 'Tủ quần áo', 'BEDROOM', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(16, 'Desk', 'Bàn làm việc', 'BEDROOM', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(17, 'Sofa Bed', 'Ghế sofa giường', 'BEDROOM', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(18, 'Balcony', 'Ban công riêng', 'COMMON', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(19, 'Parking', 'Bãi đỗ xe', 'COMMON', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(20, 'Elevator', 'Thang máy', 'COMMON', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(21, 'Swimming Pool', 'Hồ bơi', 'COMMON', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(22, 'Gym', 'Phòng tập thể dục', 'COMMON', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(23, 'Breakfast', 'Bữa sáng miễn phí', 'COMMON', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(24, 'Coffee Maker', 'Máy pha cà phê', 'COMMON', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13'),
(25, 'Fan', 'Quạt máy', 'COMMON', 0, NULL, '2025-10-02 02:46:13', '2025-10-02 02:46:13');

INSERT INTO `levels` (`id`, `name`, `minPoints`, `description`, `isActive`) VALUES
(1, 'BRONZE', 0, 'Cấp độ cơ bản', 0),
(2, 'PLATINU', 1001, 'Khách hàng cao cấp', 1),
(3, 'GOLD', 500, 'Khách hàng VIP', 1),
(4, 'PLATINUM', 1000, 'Khách hàng cao cấp', 1);

INSERT INTO `location_countries` (`id`, `name`, `code`, `createdAt`, `updatedAt`) VALUES
(1, 'Việt Nam', 'VN', '2025-11-22 10:52:46', '2025-11-22 10:52:46');

INSERT INTO `location_districts` (`id`, `provinceId`, `name`, `code`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Quận 1', 'Q1', 0, NULL, '2025-11-22 10:52:46', '2025-11-22 10:52:46'),
(2, 2, 'Ba Đình', 'BADINH', 0, NULL, '2025-11-22 10:52:46', '2025-11-22 10:52:46'),
(3, 3, 'Sơn Trà', 'SONTRA', 0, NULL, '2025-11-22 10:52:46', '2025-11-22 10:52:46');

INSERT INTO `location_provinces` (`id`, `countryId`, `name`, `code`, `imageUrl`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Hồ Chí Minh', 'HCM', '4stay/provinces/Hồ Chí Minh/zzg4ynrn1sp2g154rdya', 0, NULL, '2025-11-22 10:52:46', '2025-11-22 05:51:48'),
(2, 1, 'Hà Nội', 'HN', '4stay/provinces/Hà Nội/ehb2bk67um4bizdluqkh', 0, NULL, '2025-11-22 10:52:46', '2025-11-22 05:52:00'),
(3, 1, 'Đà Nẵng', 'DN', '4stay/provinces/Đà Nẵng/bmghsvpfguwfyybvx2nd', 0, NULL, '2025-11-22 10:52:46', '2025-11-22 05:52:12');

INSERT INTO `location_wards` (`id`, `districtId`, `name`, `code`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'Nguyễn Thái Bình', 'NTB', 0, NULL, '2025-11-22 10:52:46', '2025-11-22 10:52:46'),
(2, 2, 'Phúc Xá', 'PHUCXA', 0, NULL, '2025-11-22 10:52:46', '2025-11-22 10:52:46'),
(3, 3, 'An Hải Bắc', 'AHB', 0, NULL, '2025-11-22 10:52:46', '2025-11-22 10:52:46');

INSERT INTO `loyalty_program` (`id`, `userId`, `levelId`, `totalBookings`, `totalNights`, `points`, `lastUpgradeDate`) VALUES
(1, 1, 1, 0, 0, 0, NULL);

INSERT INTO `otp_codes` (`id`, `userId`, `email`, `otp`, `expiresAt`, `isUsed`) VALUES
(1, 1, 'admin@gmail.com', '318062', '2025-10-02 03:46:39', 1);

INSERT INTO `payment_methods` (`id`, `name`, `description`, `isActive`) VALUES
(1, 'CASH', 'Thanh toán tiền mặt', 1),
(2, 'CREDIT_CARD', 'Thanh toán bằng thẻ tín dụng', 1),
(3, 'PAYPAL', 'Thanh toán qua PayPal', 1),
(4, 'MOMO', 'Thanh toán qua ví MoMo', 1),
(5, 'VNPAY', 'Thanh toán qua VNPay', 1);

INSERT INTO `roles` (`id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'USER', 'Người dùng đặt phòng', 1, '2025-10-02 02:46:12', '2025-10-02 02:46:12'),
(2, 'HOST', 'Chủ homestay quản lý phòng', 0, '2025-10-02 02:46:12', '2025-10-02 02:46:12'),
(3, 'ADMIN', 'Quản trị hệ thống', 1, '2025-10-02 02:46:12', '2025-10-02 02:46:12');

INSERT INTO `room_amenities` (`id`, `roomId`, `amenityId`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 4),
(4, 1, 7),
(55, 1, 11),
(56, 2, 1),
(57, 2, 2),
(58, 2, 3),
(59, 2, 4),
(60, 2, 12),
(61, 3, 1),
(62, 3, 2),
(63, 3, 5),
(64, 3, 7),
(65, 3, 14),
(66, 4, 1),
(67, 4, 3),
(68, 4, 4),
(69, 4, 7),
(70, 4, 15),
(71, 5, 2),
(72, 5, 3),
(73, 5, 6),
(74, 5, 8),
(75, 5, 16),
(76, 6, 1),
(77, 6, 2),
(78, 6, 4),
(79, 6, 9),
(80, 6, 11),
(81, 7, 3),
(82, 7, 5),
(83, 7, 7),
(84, 7, 12),
(85, 7, 18),
(86, 8, 1),
(87, 8, 4),
(88, 8, 6),
(89, 8, 10),
(90, 8, 20),
(91, 9, 2),
(92, 9, 3),
(93, 9, 7),
(94, 9, 15),
(95, 9, 21),
(96, 10, 1),
(97, 10, 5),
(98, 10, 8),
(99, 10, 12),
(100, 10, 22);

INSERT INTO `room_beds` (`id`, `roomId`, `type`, `quantity`) VALUES
(1, 1, 'QUEEN', 1),
(2, 1, 'SOFA_BED', 1);

INSERT INTO `room_images` (`id`, `roomId`, `imageUrl`, `isMain`, `position`, `createdAt`, `updatedAt`) VALUES
(1, 1, '4stay/rooms/Phòng Deluxe view biển/e314m9rrli3epik3yfbj', 1, 1, '2025-10-26 00:42:49', '2025-10-26 00:42:49'),
(2, 1, '4stay/rooms/Phòng Deluxe view biển/agg7tneya7dcreneomo9', 0, 2, '2025-10-26 00:42:49', '2025-10-26 00:42:49'),
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

INSERT INTO `rooms` (`id`, `hostId`, `countryId`, `provinceId`, `districtId`, `wardId`, `street`, `fullAddress`, `name`, `description`, `price`, `adultCapacity`, `childCapacity`, `status`, `rating`, `reviewCount`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 1, 1, 1, '47/57 Nguyễn Thái Bình', '47/57 Nguyễn Thái Bình, Nguyễn Thái Bình, Quận 1, Hồ Chí Minh, Việt Nam', '4Stay Central Saigon', 'Căn hộ cao cấp ngay trung tâm Quận 1, thiết kế hiện đại, đầy đủ tiện nghi với phòng khách rộng rãi, bếp riêng, ban công hướng phố. Gần các điểm tham quan nổi tiếng, nhà hàng, quán cà phê và trung tâm thương mại. Thích hợp cho gia đình hoặc nhóm bạn muốn trải nghiệm trọn vẹn thành phố Hồ Chí Minh.', 1200000.00, 2, 1, 'AVAILABLE', 5.0, 7, 0, NULL, '2025-11-22 10:52:46', '2025-11-29 19:57:40'),
(2, 1, 1, 2, 2, 2, '12 Hoàng Hoa Thám', '12 Hoàng Hoa Thám, Phúc Xá, Ba Đình, Hà Nội, Việt Nam', '4Stay Hanoi View', 'Phòng đôi view Hồ Tây yên tĩnh, thiết kế ấm cúng, nội thất tiện nghi. Cửa sổ lớn đón nắng sớm, không gian thoáng đãng, lý tưởng cho kỳ nghỉ lãng mạn hoặc công tác. Gần các di tích lịch sử, nhà hàng truyền thống và phố cổ Hà Nội.', 950000.00, 2, 0, 'AVAILABLE', 4.6, 5, 0, NULL, '2025-11-22 10:52:46', '2025-11-29 19:57:40'),
(3, 1, 1, 3, 3, 3, '5 Trần Hưng Đạo', '5 Trần Hưng Đạo, An Hải Bắc, Sơn Trà, Đà Nẵng, Việt Nam', '4Stay Da Nang Riverside', 'Phòng sát sông Hàn, gần cầu Rồng, thiết kế hiện đại, sáng sủa với ban công nhìn ra sông. Nội thất đầy đủ với giường thoải mái, phòng tắm tiện nghi. Phù hợp cho cả khách du lịch và công tác, dễ dàng di chuyển đến các điểm tham quan nổi tiếng.', 880000.00, 2, 1, 'AVAILABLE', 4.2, 5, 0, NULL, '2025-11-22 10:52:46', '2025-11-29 19:57:40'),
(4, 1, 1, 1, 1, 1, '22 Lê Lợi', '22 Lê Lợi, Nguyễn Thái Bình, Quận 1, Hồ Chí Minh, Việt Nam', 'Saigon Luxury Loft', 'Căn hộ kiểu loft cực sang trọng, thiết kế mở với trần cao, phòng khách rộng rãi và khu bếp tiện nghi. View thành phố tuyệt đẹp, nội thất hiện đại, phù hợp cho gia đình hoặc nhóm bạn. Gần các trung tâm thương mại, nhà hàng cao cấp và phố đi bộ.', 1500000.00, 3, 1, 'AVAILABLE', 4.6, 7, 0, NULL, '2025-11-29 18:50:19', '2025-11-29 20:06:27'),
(5, 1, 1, 2, 2, 2, '88 Thụy Khuê', '88 Thụy Khuê, Phúc Xá, Ba Đình, Hà Nội, Việt Nam', 'Hanoi Old Quarter Home', 'Phòng ấm cúng trong phố cổ, kết hợp nét truyền thống và hiện đại. Nội thất đầy đủ, có bếp nhỏ, không gian yên tĩnh, gần các quán ăn, cửa hàng lưu niệm. Thích hợp cho du khách muốn khám phá văn hóa và ẩm thực Hà Nội.', 780000.00, 2, 1, 'AVAILABLE', 4.7, 7, 0, NULL, '2025-11-29 18:50:19', '2025-11-29 20:06:27'),
(6, 1, 1, 3, 3, 3, '19 Võ Văn Kiệt', '19 Võ Văn Kiệt, An Hải Bắc, Sơn Trà, Đà Nẵng, Việt Nam', 'Da Nang Beachfront', 'Phòng hướng biển Mỹ Khê, thiết kế hiện đại, ban công nhìn ra bãi biển. Nội thất tiện nghi, phòng tắm đầy đủ tiện ích, phù hợp cho kỳ nghỉ thư giãn, tắm biển và thưởng thức cảnh bình minh trên biển.', 1100000.00, 2, 1, 'AVAILABLE', 4.6, 7, 0, NULL, '2025-11-29 18:50:19', '2025-11-29 20:06:27'),
(7, 1, 1, 1, 1, 1, '10 Nguyễn Huệ', '10 Nguyễn Huệ, Nguyễn Thái Bình, Quận 1, Hồ Chí Minh, Việt Nam', 'Saigon Walking Street Studio', 'Studio ngay phố đi bộ Nguyễn Huệ, thiết kế nhỏ gọn nhưng tiện nghi đầy đủ. View đường phố sầm uất, thuận tiện tham quan các quán cà phê, nhà hàng, trung tâm mua sắm. Lý tưởng cho các cặp đôi hoặc khách công tác.', 1350000.00, 2, 0, 'AVAILABLE', 4.7, 3, 0, NULL, '2025-11-29 18:50:19', '2025-11-29 19:58:08'),
(8, 1, 1, 2, 2, 2, '55 Nguyễn Trãi', '55 Nguyễn Trãi, Phúc Xá, Ba Đình, Hà Nội, Việt Nam', 'Hanoi Cozy Apartment', 'Căn hộ mini tiện nghi tại trung tâm Hà Nội, thiết kế hiện đại, phòng ngủ và phòng khách đầy đủ tiện ích. Gần các quán ăn, cửa hàng, thuận tiện di chuyển đến các điểm tham quan nổi tiếng. Phù hợp cho khách công tác hoặc du lịch ngắn ngày.', 650000.00, 2, 1, 'AVAILABLE', 4.2, 0, 0, NULL, '2025-11-29 18:50:19', '2025-11-29 19:57:40'),
(9, 1, 1, 3, 3, 3, '77 Bạch Đằng', '77 Bạch Đằng, An Hải Bắc, Sơn Trà, Đà Nẵng, Việt Nam', 'Da Nang River Suite', 'Suite cao cấp nhìn sông Hàn, thiết kế rộng rãi, trang bị nội thất hiện đại, ban công thoáng mát. Thích hợp cho gia đình hoặc nhóm bạn muốn trải nghiệm kỳ nghỉ sang trọng. Gần các nhà hàng, khu giải trí và bãi biển nổi tiếng.', 1600000.00, 3, 1, 'AVAILABLE', 4.0, 3, 0, NULL, '2025-11-29 18:50:19', '2025-11-29 19:57:40'),
(10, 1, 1, 1, 1, 1, '320 Lý Tự Trọng', '320 Lý Tự Trọng, Nguyễn Thái Bình, Quận 1, Hồ Chí Minh, Việt Nam', 'Saigon City View', 'Phòng view thành phố tuyệt đẹp, thiết kế ấm cúng, đầy đủ tiện nghi với giường thoải mái, bàn làm việc, phòng tắm riêng. Gần các trung tâm thương mại, quán cà phê, thuận tiện cho cả khách du lịch và công tác.', 900000.00, 2, 1, 'AVAILABLE', 4.5, 2, 0, NULL, '2025-11-29 18:50:19', '2025-11-29 19:57:40');

INSERT INTO `user_roles` (`id`, `userId`, `roleId`) VALUES
(1, 1, 3);

INSERT INTO `users` (`id`, `email`, `password`, `firstName`, `lastName`, `phoneNumber`, `dateOfBirth`, `gender`, `avatar`, `country`, `isVerified`, `isActive`, `googleId`, `provider`, `lastLogin`, `isDeleted`, `deletedAt`, `createdAt`, `updatedAt`) VALUES
(1, 'admin@gmail.com', '$2b$10$ch/gepo7MiSD7MCZ9PpW0uSI.upAxnfdSvrbMLmrtzhY7.tZ0fKj6', 'admin', 'vieet', '0901234567', NULL, NULL, '4stay/avatars/j4slezbrbdehcomrhje8', 'Vietnam', 1, 1, NULL, 'LOCAL', NULL, 0, NULL, '2025-10-26 00:33:42', '2025-11-28 16:33:25');


/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;