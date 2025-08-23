CREATE TABLE `roles` (
    `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL UNIQUE, -- USER, HOST, ADMIN
    `description` TEXT NULL,
    `isActive` TINYINT(1) NOT NULL DEFAULT 1, -- 1 = active, 0 = inactive

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

CREATE TABLE `loyalty_program` (
    `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    
    `userId` INT NOT NULL,
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


CREATE TABLE `otp_codes` (
    `id` INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `userId` INT NULL, -- null nếu user chưa tồn tại
    `email` VARCHAR(255) NOT NULL,
    `otp` VARCHAR(10) NOT NULL,
    `type` ENUM('REGISTER', 'FORGOT_PASSWORD') NOT NULL,
    `expiresAt` TIMESTAMP NOT NULL,
    `isUsed` TINYINT(1) NOT NULL DEFAULT 0,

    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL,

    `deletedBy` INT NOT NULL DEFAULT 0,
    `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
    `deletedAt` TIMESTAMP NULL DEFAULT NULL,
    `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

