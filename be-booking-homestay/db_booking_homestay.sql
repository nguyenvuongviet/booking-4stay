-- Table template
CREATE TABLE `TABLE_TEMPLATE` (
	`id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT, -- mặc định luôn luôn có
	
	
	-- mặc định luôn luôn có
	`deletedBy` INT NOT NULL DEFAULT 0,
	`isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
	`deletedAt` TIMESTAMP NULL DEFAULT NULL,
	`createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `roles` (
    `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL UNIQUE, 
    `description` TEXT NULL,
    `isActive` TINYINT(1) NOT NULL DEFAULT 1, 

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO `roles` (`name`, `description`, `isActive`) VALUES
('USER', 'Người dùng đặt phòng', 1),
('HOST', 'Chủ homestay quản lý phòng', 1),
('ADMIN', 'Quản trị hệ thống', 1);

CREATE TABLE `users` (
    `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    
    `email` VARCHAR(255) NOT NULL UNIQUE,
    `password` VARCHAR(255) NULL, -- có thể null nếu đăng nhập Google
    `fullName` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(20) NULL,
    `dateOfBirth` DATE NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `avatar` TEXT NULL,
    `country` VARCHAR(100) NULL, -- chỉ lưu quốc gia
    `isVerified` TINYINT(1) NOT NULL DEFAULT 0,
    `isActive` TINYINT(1) NOT NULL DEFAULT 0,

    -- OAuth
    `googleId` VARCHAR(255) NULL,
    `provider` ENUM('LOCAL', 'GOOGLE') NOT NULL DEFAULT 'LOCAL',

    `lastLogin` TIMESTAMP NULL DEFAULT NULL,

    -- Liên kết role
    `roleId` INT NOT NULL,
    FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`),

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `otp_codes` (
    `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `userId` INT NULL,
    `email` VARCHAR(255) NOT NULL,
    `otp` VARCHAR(10) NOT NULL,
    `expiresAt` TIMESTAMP NOT NULL,
    `isUsed` TINYINT(1) NOT NULL DEFAULT 0,

    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL,

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `loyalty_program` (
    `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    
    `userId` INT NOT NULL UNIQUE,
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,

    `totalBookings` INT NOT NULL DEFAULT 0,      
    `totalNights` INT NOT NULL DEFAULT 0,        
    `points` INT NOT NULL DEFAULT 0,             
    `level` ENUM('BRONZE', 'SILVER', 'GOLD', 'PLATINUM') 
        NOT NULL DEFAULT 'BRONZE',
    `lastUpgradeDate` TIMESTAMP NULL DEFAULT NULL,

    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `rooms` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `hostId` INT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(12,2) NOT NULL,
    `capacity` INT NOT NULL,
    `guests` INT NOT NULL DEFAULT 1, 
    `status` ENUM('AVAILABLE', 'BOOKED', 'MAINTENANCE') DEFAULT 'AVAILABLE',

    -- mở rộng cho nhiều homestay
    `address` VARCHAR(255) NULL,
    `locationLat` DECIMAL(10, 7) NULL, -- latitude
    `locationLng` DECIMAL(10, 7) NULL, -- longitude

    FOREIGN KEY (`hostId`) REFERENCES `users`(`id`),

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `amenities` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `description` TEXT NULL,

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO `amenities` (`name`, `description`) VALUES
('Wifi', 'Kết nối internet tốc độ cao'),
('Air Conditioner', 'Điều hòa nhiệt độ'),
('Television', 'TV màn hình phẳng'),
('Refrigerator', 'Tủ lạnh mini hoặc lớn'),
('Kitchen', 'Khu bếp riêng với đầy đủ dụng cụ'),
('Washing Machine', 'Máy giặt tiện lợi'),
('Parking', 'Bãi đỗ xe miễn phí hoặc trả phí'),
('Swimming Pool', 'Hồ bơi riêng hoặc chung'),
('Balcony', 'Ban công riêng'),
('Bath Tub', 'Bồn tắm'),
('Breakfast', 'Bữa sáng miễn phí'),
('Desk', 'Bàn làm việc'),
('Hair Dryer', 'Máy sấy tóc'),
('Iron', 'Bàn ủi'),
('Coffee Maker', 'Máy pha cà phê'),
('Microwave', 'Lò vi sóng');

CREATE TABLE `room_amenities` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `roomId` INT NOT NULL,
    `amenityId` INT NOT NULL,

    FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`amenityId`) REFERENCES `amenities`(`id`) ON DELETE CASCADE,
    UNIQUE KEY `room_amenity_unique` (`roomId`, `amenityId`),

    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `room_images` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `roomId` INT NOT NULL,
    `imageUrl` TEXT NOT NULL,
    `isMain` TINYINT(1) NOT NULL DEFAULT 0, -- 1 = ảnh đại diện, 0 = ảnh thường
    `position` INT NULL, -- vị trí sắp xếp (1,2,3,...)

    FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE,

    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE `bookings` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `userId` INT NOT NULL,
    `roomId` INT NOT NULL,
    `checkIn` DATE NOT NULL,
    `checkOut` DATE NOT NULL,
    `guests` INT NOT NULL DEFAULT 1, -- số khách đặt
    `totalPrice` DECIMAL(12,2) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'REFUNDED') DEFAULT 'PENDING',

    FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
    FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`),

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `payments` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `bookingId` INT NOT NULL,
    `amount` DECIMAL(12,2) NOT NULL,
    `method` ENUM('CASH', 'CREDIT_CARD', 'PAYPAL') NOT NULL,
    `paymentGateway` VARCHAR(50) NULL, -- cổng thanh toán (ví dụ momo, vnpay)   
    `transactionId` VARCHAR(255) NULL, -- mã giao dịch từ gateway
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    `transactionDate` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`),

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `reviews` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `bookingId` INT NOT NULL,
    `userId` INT NOT NULL,
    `rating` INT CHECK (rating BETWEEN 1 AND 5),
    `comment` TEXT,

    FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`),
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`),

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `contacts` (
    `id` INT PRIMARY KEY AUTO_INCREMENT,
    `userId` INT NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,

    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL,

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

