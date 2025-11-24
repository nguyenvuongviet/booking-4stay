CREATE DATABASE IF NOT EXISTS `db_booking_homestay`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE `db_booking_homestay`;

SET FOREIGN_KEY_CHECKS = 0;

/* ==========================================================
   🌍 LOCATION TABLES
   ========================================================== */

CREATE TABLE `location_countries` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `code` CHAR(2) NOT NULL UNIQUE,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `location_provinces` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `countryId` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) DEFAULT NULL,
  `imageUrl` VARCHAR(255) DEFAULT NULL,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,  
  `deletedAt` TIMESTAMP NULL DEFAULT NULL, 
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_province_name` (`name`),
  CONSTRAINT `fk_province_country`
    FOREIGN KEY (`countryId`) REFERENCES `location_countries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `location_districts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `provinceId` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) DEFAULT NULL,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,  
  `deletedAt` TIMESTAMP NULL DEFAULT NULL, 
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_district_name` (`provinceId`, `name`),
  CONSTRAINT `fk_district_province`
    FOREIGN KEY (`provinceId`) REFERENCES `location_provinces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `location_wards` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `districtId` INT UNSIGNED NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `code` VARCHAR(20) DEFAULT NULL,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,  
  `deletedAt` TIMESTAMP NULL DEFAULT NULL, 
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_ward_name` (`districtId`, `name`),
  CONSTRAINT `fk_ward_district`
    FOREIGN KEY (`districtId`) REFERENCES `location_districts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


/* ==========================================================
   👤 USERS & ROLES
   ========================================================== */

CREATE TABLE `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) DEFAULT NULL,
  `firstName` VARCHAR(255) NOT NULL,
  `lastName` VARCHAR(255) NOT NULL,
  `phoneNumber` VARCHAR(20) DEFAULT NULL,
  `dateOfBirth` DATE DEFAULT NULL,
  `gender` ENUM('MALE','FEMALE','OTHER') DEFAULT NULL,
  `avatar` TEXT,
  `country` VARCHAR(100) DEFAULT NULL,
  `isVerified` TINYINT(1) NOT NULL DEFAULT 0,
  `isActive` TINYINT(1) NOT NULL DEFAULT 0,
  `googleId` VARCHAR(255) DEFAULT NULL,
  `provider` ENUM('LOCAL','GOOGLE') NOT NULL DEFAULT 'LOCAL',
  `lastLogin` TIMESTAMP NULL DEFAULT NULL,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  `deletedAt` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL UNIQUE,
  `description` TEXT,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `roleId` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_role` (`userId`, `roleId`),
  CONSTRAINT `fk_user_role_user`
    FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_role_role`
    FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


/* ==========================================================
   🏠 ROOMS & RELATED
   ========================================================== */

CREATE TABLE `rooms` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `hostId` INT UNSIGNED NOT NULL,
  `countryId` INT UNSIGNED DEFAULT 1,
  `provinceId` INT UNSIGNED NOT NULL,
  `districtId` INT UNSIGNED NOT NULL,
  `wardId` INT UNSIGNED NULL,
  `street` VARCHAR(255) DEFAULT NULL,
  `fullAddress` VARCHAR(255),
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `price` DECIMAL(12,2) NOT NULL,
  `adultCapacity` INT UNSIGNED NOT NULL,
  `childCapacity` INT UNSIGNED NOT NULL DEFAULT 0,
  `status` ENUM('AVAILABLE','BOOKED','MAINTENANCE') DEFAULT 'AVAILABLE',
  `rating` DECIMAL(2,1) DEFAULT 0.0,
  `reviewCount` INT UNSIGNED DEFAULT 0,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  `deletedAt` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rooms_location` (`provinceId`,`districtId`,`wardId`), 
  CONSTRAINT `fk_room_host` FOREIGN KEY (`hostId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_room_country` FOREIGN KEY (`countryId`) REFERENCES `location_countries` (`id`),
  CONSTRAINT `fk_room_province` FOREIGN KEY (`provinceId`) REFERENCES `location_provinces` (`id`),
  CONSTRAINT `fk_room_district` FOREIGN KEY (`districtId`) REFERENCES `location_districts` (`id`),
  CONSTRAINT `fk_room_ward` FOREIGN KEY (`wardId`) REFERENCES `location_wards` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `room_images` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `roomId` INT UNSIGNED NOT NULL,
  `imageUrl` VARCHAR(255) NOT NULL,
  `isMain` TINYINT(1) NOT NULL DEFAULT 0,
  `position` INT DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_room_image_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `room_beds` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `roomId` INT UNSIGNED NOT NULL,
  `type` ENUM('SINGLE','DOUBLE','QUEEN','KING','SOFA_BED','BUNK_BED') NOT NULL,
  `quantity` INT UNSIGNED NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_room_bed_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `amenities` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `category` ENUM('BASIC','BATHROOM','BEDROOM','COMMON') NOT NULL DEFAULT 'BASIC',
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  `deletedAt` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_amenity_name` (`name`),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `room_amenities` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `roomId` INT UNSIGNED NOT NULL,
  `amenityId` INT UNSIGNED NOT NULL,
  UNIQUE KEY `uq_room_amenity` (`roomId`, `amenityId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_room_amenity_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_room_amenity_amenity` FOREIGN KEY (`amenityId`) REFERENCES `amenities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `bookings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `roomId` INT UNSIGNED NOT NULL,
  `checkIn` DATE NOT NULL,
  `checkOut` DATE NOT NULL,
  `adults` INT UNSIGNED NOT NULL,
  `children` INT UNSIGNED DEFAULT 0,
  `totalPrice` DECIMAL(12,2) NOT NULL,
  `status` ENUM('PENDING','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `isReview` TINYINT(1) NOT NULL DEFAULT 0,
  `cancelReason` VARCHAR(255) DEFAULT NULL,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  `deletedAt` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bookings_user_room` (`userId`,`roomId`),
  KEY `idx_bookings_isDeleted` (`isDeleted`),
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `reviews` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bookingId` INT UNSIGNED NOT NULL UNIQUE,
  `userId` INT UNSIGNED NOT NULL,
  `rating` DECIMAL(2,1) DEFAULT NULL,
  `comment` VARCHAR(1000) DEFAULT NULL,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  `deletedAt` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_rating` (`rating`),
  CONSTRAINT `fk_review_booking` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`),
  CONSTRAINT `fk_review_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payment_methods` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_method_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `payments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `bookingId` INT UNSIGNED NOT NULL,
  `amount` DECIMAL(12,2) NOT NULL,
  `paymentMethodId` INT UNSIGNED NOT NULL,
  `paymentGateway` VARCHAR(50) DEFAULT NULL,
  `transactionId` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('PENDING','SUCCESS','FAILED') NOT NULL DEFAULT 'PENDING',
  `transactionDate` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  `deletedAt` TIMESTAMP NULL DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_payments_status_date` (`status`, `transactionDate`),
  CONSTRAINT `fk_payment_booking` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_payment_method` FOREIGN KEY (`paymentMethodId`) REFERENCES `payment_methods` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `levels` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `minPoints` INT UNSIGNED NOT NULL DEFAULT 0,
  `description` VARCHAR(255) DEFAULT NULL,
  `isActive` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_level_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `loyalty_program` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED NOT NULL,
  `levelId` INT UNSIGNED NOT NULL,
  `totalBookings` INT UNSIGNED NOT NULL DEFAULT 0,
  `totalNights` INT UNSIGNED NOT NULL DEFAULT 0,
  `points` INT UNSIGNED NOT NULL DEFAULT 0,
  `lastUpgradeDate` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_loyalty_user_level` (`userId`, `levelId`),
  UNIQUE KEY `uq_loyalty_user` (`userId`),
  CONSTRAINT `fk_loyalty_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_loyalty_level` FOREIGN KEY (`levelId`) REFERENCES `levels` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `otp_codes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED DEFAULT NULL,
  `email` VARCHAR(255) NOT NULL,
  `otp` VARCHAR(10) NOT NULL,
  `expiresAt` TIMESTAMP NOT NULL,
  `isUsed` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_otp_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `contacts` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `userId` INT UNSIGNED DEFAULT NULL,
  `fullName` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `message` VARCHAR(1000) NOT NULL,
  `isDeleted` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_contact_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `room_prices` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `roomId` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_price` (`roomId`, `date`),
  KEY `idx_room_price_date` (`date`),
  CONSTRAINT `fk_room_price_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `room_availability` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `roomId` INT UNSIGNED NOT NULL,
  `date` DATE NOT NULL,
  `isAvailable` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_availability` (`roomId`, `date`),
  KEY `idx_room_availability_date` (`date`),
  CONSTRAINT `fk_room_availability_room`
    FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
