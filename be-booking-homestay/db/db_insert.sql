INSERT INTO `roles` (`name`, `description`, `isActive`)
VALUES 
('USER', 'Người dùng đặt phòng', 1),
('HOST', 'Chủ homestay quản lý phòng', 0),
('ADMIN', 'Quản trị hệ thống', 1);

INSERT INTO `users` (`email`,`password`,`firstName`,`lastName`,`phoneNumber`,`country`,`isVerified`,`isActive`)
VALUES
('admin@gmail.com','hashedpwd1','admin','vieet','0901234567','Vietnam',1,1),
('user1@example.com','hashedpwd2','Bob','Tran','0907654321','Vietnam',1,1),
('user2@example.com','hashedpwd3','Hieu','Le','0911111111','Vietnam',1,1);

INSERT INTO `user_roles` (`userId`,`roleId`)
VALUES 
(1,3),
(2,1),
(3,1);

INSERT INTO `loyalty_levels` (`name`,`minPoints`,`description`) VALUES
('BRONZE', 0, 'Cấp độ cơ bản'),
('SILVER', 100, 'Khách hàng thân thiết'),
('GOLD', 500, 'Khách hàng VIP'),
('PLATINUM', 1000, 'Khách hàng cao cấp');

INSERT INTO `locations` (`province`,`district`,`ward`,`street`,`latitude`,`longitude`) VALUES
('Ho Chi Minh','District 1','Ben Nghe','123 Nguyen Hue',10.7769,106.7009),
('Ho Chi Minh','District 3','Ward 6','45 Vo Van Tan',10.7820,106.6950),
('Da Nang','Hai Chau','Thach Thang','99 Bach Dang',16.0678,108.2208);

INSERT INTO `rooms` (`hostId`,`locationId`,`name`,`description`,`price`,`adultCapacity`,`childCapacity`,`status`)
VALUES
(3,1,'Deluxe Room Saigon','Phòng view phố đi bộ Nguyễn Huệ, có ban công',800000,2,1,'AVAILABLE'),
(3,2,'Studio Cozy D3','Căn hộ nhỏ ấm cúng quận 3',600000,2,1,'AVAILABLE'),
(3,3,'Riverside Danang','Phòng cạnh sông Hàn, view cầu Rồng',1200000,3,2,'AVAILABLE');

INSERT INTO `room_beds` (`roomId`,`type`,`quantity`) VALUES
(1,'DOUBLE',1),
(2,'QUEEN',1),
(3,'DOUBLE',2),
(3,'SOFA_BED',1);

INSERT INTO `amenities` (`name`, `description`, `category`) VALUES
-- BASIC
('Wifi', 'Internet tốc độ cao', 'BASIC'),
('Air Conditioner', 'Điều hòa nhiệt độ', 'BASIC'),
('Heating', 'Máy sưởi', 'BASIC'),
('Television', 'TV màn hình phẳng', 'BASIC'),
('Refrigerator', 'Tủ lạnh', 'BASIC'),
('Microwave', 'Lò vi sóng', 'BASIC'),
('Kitchen', 'Khu bếp riêng', 'BASIC'),
('Washing Machine', 'Máy giặt', 'BASIC'),
('Iron', 'Bàn ủi', 'BASIC'),
('Hair Dryer', 'Máy sấy tóc', 'BASIC'),
-- BATHROOM
('Shower', 'Vòi sen', 'BATHROOM'),
('Bath Tub', 'Bồn tắm', 'BATHROOM'),
('Toiletries', 'Đồ vệ sinh cá nhân miễn phí', 'BATHROOM'),
('Toilet Paper', 'Giấy vệ sinh', 'BATHROOM'),
-- BEDROOM
('Wardrobe', 'Tủ quần áo', 'BEDROOM'),
('Desk', 'Bàn làm việc', 'BEDROOM'),
('Sofa Bed', 'Ghế sofa giường', 'BEDROOM'),
-- COMMON
('Balcony', 'Ban công riêng', 'COMMON'),
('Parking', 'Bãi đỗ xe', 'COMMON'),
('Elevator', 'Thang máy', 'COMMON'),
('Swimming Pool', 'Hồ bơi', 'COMMON'),
('Gym', 'Phòng tập thể dục', 'COMMON'),
('Breakfast', 'Bữa sáng miễn phí', 'COMMON'),
('Coffee Maker', 'Máy pha cà phê', 'COMMON'),
('Fan', 'Quạt máy', 'COMMON');

-- Room 1: Deluxe Room Saigon
INSERT INTO `room_amenities` (`roomId`,`amenityId`) VALUES
(1,1),  -- Wifi
(1,2),  -- Air Conditioner
(1,4),  -- Television
(1,5),  -- Refrigerator
(1,7),  -- Kitchen
(1,19), -- Balcony
-- Room 2: Studio Cozy D3
(2,1),  -- Wifi
(2,2),  -- Air Conditioner
(2,6),  -- Microwave
(2,7),  -- Kitchen
(2,18), -- Sofa Bed
(2,20), -- Parking
-- Room 3: Riverside Danang
(3,1),  -- Wifi
(3,2),  -- Air Conditioner
(3,4),  -- Television
(3,10), -- Hair Dryer
(3,12), -- Bath Tub
(3,21), -- Swimming Pool
(3,22); -- Gym

INSERT INTO `room_images` (`roomId`,`imageUrl`,`isMain`,`position`) VALUES
(1,'https://example.com/room1-main.jpg',1,1),
(1,'https://example.com/room1-extra1.jpg',0,2),
(2,'https://example.com/room2-main.jpg',1,1),
(3,'https://example.com/room3-main.jpg',1,1);

INSERT INTO `bookings` (`userId`,`roomId`,`checkIn`,`checkOut`,`adults`,`children`,`totalPrice`,`status`)
VALUES
(1,1,'2025-10-10','2025-10-12',2,0,1600000,'CONFIRMED'),
(2,2,'2025-10-15','2025-10-17',1,1,1200000,'PENDING');

INSERT INTO `payment_methods` (`name`,`description`,`isActive`) VALUES
('CASH','Thanh toán tiền mặt',1),
('CREDIT_CARD','Thanh toán bằng thẻ tín dụng',1),
('PAYPAL','Thanh toán qua PayPal',1),
('MOMO','Thanh toán qua ví MoMo',1),
('VNPAY','Thanh toán qua VNPay',1);

INSERT INTO `payments` (`bookingId`,`amount`,`paymentMethodId`,`status`)
VALUES
(1,1600000,1,'SUCCESS'),
(2,1200000,2,'PENDING');

INSERT INTO `reviews` (`bookingId`,`userId`,`rating`,`comment`)
VALUES
(1,1,5.0,'Phòng đẹp, sạch sẽ, vị trí trung tâm'),
(1,2,4.5,'View đẹp nhưng hơi ồn buổi tối');

INSERT INTO `contacts` (`userId`,`fullName`,`email`,`message`)
VALUES
(1,'Alice Nguyen','alice@example.com','Tôi muốn hỏi về dịch vụ dọn phòng.'),
(2,'Bob Tran','bob@example.com','Có thể check-in sớm được không?');
