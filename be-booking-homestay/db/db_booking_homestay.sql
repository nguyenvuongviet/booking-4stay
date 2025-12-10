DROP DATABASE IF EXISTS `db_booking_homestay`;
CREATE DATABASE IF NOT EXISTS `db_booking_homestay`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE `db_booking_homestay`;

-- -------------------------------------------------------------
-- TablePlus 6.7.4(642)
--
-- https://tableplus.com/
--
-- Database: db_booking_homestay
-- Generation Time: 2025-11-25 06:01:11.8590
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP TABLE IF EXISTS `amenities`;
CREATE TABLE `amenities` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `category` enum('BASIC','BATHROOM','BEDROOM','COMMON') NOT NULL DEFAULT 'BASIC',
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_amenity_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `bookings`;
CREATE TABLE `bookings` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int unsigned NOT NULL,
  `roomId` int unsigned NOT NULL,
  `guestFullName` varchar(100) NOT NULL,
  `guestEmail` varchar(100) NOT NULL,
  `guestPhoneNumber` varchar(20) NOT NULL,
  `specialRequest` varchar(500) DEFAULT NULL,
  `checkIn` date NOT NULL,
  `checkOut` date NOT NULL,
  `adults` int unsigned NOT NULL,
  `children` int unsigned DEFAULT '0',
  `totalPrice` decimal(12,2) NOT NULL,
  `status` enum('PENDING','PARTIALLY_PAID','CONFIRMED','CHECKED_IN','CHECKED_OUT','CANCELLED','WAITING_REFUND','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `paymentMethod` enum('VNPAY','CASH','BANK_TRANSFER') NOT NULL DEFAULT 'CASH',
  `paidAmount` decimal(12,2) NOT NULL DEFAULT '0.00',
  `isReview` tinyint(1) NOT NULL DEFAULT '0',
  `cancelReason` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_bookings_user_room` (`userId`,`roomId`),
  KEY `idx_bookings_isDeleted` (`isDeleted`),
  KEY `fk_booking_room` (`roomId`),
  CONSTRAINT `fk_booking_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int unsigned DEFAULT NULL,
  `fullName` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `message` varchar(1000) NOT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_contact_user` (`userId`),
  CONSTRAINT `fk_contact_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `levels`;
CREATE TABLE `levels` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `minPoints` int unsigned NOT NULL DEFAULT '0',
  `description` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_level_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `location_countries`;
CREATE TABLE `location_countries` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `code` char(2) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `location_districts`;
CREATE TABLE `location_districts` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `provinceId` int unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_district_name` (`provinceId`,`name`),
  CONSTRAINT `fk_district_province` FOREIGN KEY (`provinceId`) REFERENCES `location_provinces` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `location_provinces`;
CREATE TABLE `location_provinces` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `countryId` int unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `imageUrl` varchar(255) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_province_name` (`name`),
  KEY `fk_province_country` (`countryId`),
  CONSTRAINT `fk_province_country` FOREIGN KEY (`countryId`) REFERENCES `location_countries` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `location_wards`;
CREATE TABLE `location_wards` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `districtId` int unsigned NOT NULL,
  `name` varchar(100) NOT NULL,
  `code` varchar(20) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_location_ward_name` (`districtId`,`name`),
  CONSTRAINT `fk_ward_district` FOREIGN KEY (`districtId`) REFERENCES `location_districts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `loyalty_program`;
CREATE TABLE `loyalty_program` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int unsigned NOT NULL,
  `levelId` int unsigned NOT NULL,
  `totalBookings` int unsigned NOT NULL DEFAULT '0',
  `totalNights` int unsigned NOT NULL DEFAULT '0',
  `points` int unsigned NOT NULL DEFAULT '0',
  `lastUpgradeDate` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_loyalty_user` (`userId`),
  KEY `idx_loyalty_user_level` (`userId`,`levelId`),
  KEY `fk_loyalty_level` (`levelId`),
  CONSTRAINT `fk_loyalty_level` FOREIGN KEY (`levelId`) REFERENCES `levels` (`id`),
  CONSTRAINT `fk_loyalty_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `otp_codes`;
CREATE TABLE `otp_codes` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int unsigned DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `otp` varchar(10) NOT NULL,
  `expiresAt` timestamp NOT NULL,
  `isUsed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `fk_otp_user` (`userId`),
  CONSTRAINT `fk_otp_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_payment_method_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `payments`;
CREATE TABLE `payments` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `bookingId` int unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `txnRef` varchar(64) NOT NULL,
  `transactionNo` varchar(64) DEFAULT NULL,
  `transactionDate` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `bankCode` varchar(20) DEFAULT NULL,
  `cardType` varchar(50) DEFAULT NULL,
  `paymentGateway` varchar(50) NOT NULL DEFAULT 'VNPAY',
  `status` enum('PENDING','SUCCESS','FAILED','CANCELED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `rawData` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_txnRef` (`txnRef`),
  UNIQUE KEY `uniq_transactionNo` (`transactionNo`),
  KEY `idx_booking` (`bookingId`),
  CONSTRAINT `fk_payment_booking` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `refunds`;
CREATE TABLE `refunds` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `paymentId` int unsigned NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `createdBy` int unsigned NOT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `requestId` varchar(50) DEFAULT NULL,
  `transactionType` varchar(10) DEFAULT NULL,
  `rspCode` varchar(10) DEFAULT NULL,
  `rspMessage` varchar(255) DEFAULT NULL,
  `transactionDate` datetime DEFAULT NULL,
  `rawData` json DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_paymentId` (`paymentId`),
  KEY `fk_refunds_createdBy` (`createdBy`),
  CONSTRAINT `fk_refund_payment` FOREIGN KEY (`paymentId`) REFERENCES `payments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_refunds_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `bookingId` int unsigned NOT NULL,
  `userId` int unsigned NOT NULL,
  `rating` decimal(2,1) DEFAULT NULL,
  `comment` varchar(1000) DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookingId` (`bookingId`),
  KEY `idx_reviews_rating` (`rating`),
  KEY `fk_review_user` (`userId`),
  CONSTRAINT `fk_review_booking` FOREIGN KEY (`bookingId`) REFERENCES `bookings` (`id`),
  CONSTRAINT `fk_review_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `description` text,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `room_amenities`;
CREATE TABLE `room_amenities` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roomId` int unsigned NOT NULL,
  `amenityId` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_amenity` (`roomId`,`amenityId`),
  KEY `fk_room_amenity_amenity` (`amenityId`),
  CONSTRAINT `fk_room_amenity_amenity` FOREIGN KEY (`amenityId`) REFERENCES `amenities` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_room_amenity_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `room_availability`;
CREATE TABLE `room_availability` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roomId` int unsigned NOT NULL,
  `date` date NOT NULL,
  `isAvailable` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_availability` (`roomId`,`date`),
  KEY `idx_room_availability_date` (`date`),
  CONSTRAINT `fk_room_availability_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `room_beds`;
CREATE TABLE `room_beds` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roomId` int unsigned NOT NULL,
  `type` enum('SINGLE','DOUBLE','QUEEN','KING','SOFA_BED','BUNK_BED') NOT NULL,
  `quantity` int unsigned NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fk_room_bed_room` (`roomId`),
  CONSTRAINT `fk_room_bed_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `room_images`;
CREATE TABLE `room_images` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roomId` int unsigned NOT NULL,
  `imageUrl` varchar(255) NOT NULL,
  `isMain` tinyint(1) NOT NULL DEFAULT '0',
  `position` int DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_room_image_room` (`roomId`),
  CONSTRAINT `fk_room_image_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `room_prices`;
CREATE TABLE `room_prices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `roomId` int unsigned NOT NULL,
  `date` date NOT NULL,
  `price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_room_price` (`roomId`,`date`),
  KEY `idx_room_price_date` (`date`),
  CONSTRAINT `fk_room_price_room` FOREIGN KEY (`roomId`) REFERENCES `rooms` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `rooms`;
CREATE TABLE `rooms` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `hostId` int unsigned NOT NULL,
  `countryId` int unsigned DEFAULT '1',
  `provinceId` int unsigned NOT NULL,
  `districtId` int unsigned NOT NULL,
  `wardId` int unsigned DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `fullAddress` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(12,2) NOT NULL,
  `adultCapacity` int unsigned NOT NULL,
  `childCapacity` int unsigned NOT NULL DEFAULT '0',
  `status` enum('AVAILABLE','BOOKED','MAINTENANCE') DEFAULT 'AVAILABLE',
  `rating` decimal(2,1) DEFAULT '0.0',
  `reviewCount` int unsigned DEFAULT '0',
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_rooms_location` (`provinceId`,`districtId`,`wardId`),
  KEY `fk_room_host` (`hostId`),
  KEY `fk_room_country` (`countryId`),
  KEY `fk_room_district` (`districtId`),
  KEY `fk_room_ward` (`wardId`),
  CONSTRAINT `fk_room_country` FOREIGN KEY (`countryId`) REFERENCES `location_countries` (`id`),
  CONSTRAINT `fk_room_district` FOREIGN KEY (`districtId`) REFERENCES `location_districts` (`id`),
  CONSTRAINT `fk_room_host` FOREIGN KEY (`hostId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_room_province` FOREIGN KEY (`provinceId`) REFERENCES `location_provinces` (`id`),
  CONSTRAINT `fk_room_ward` FOREIGN KEY (`wardId`) REFERENCES `location_wards` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `userId` int unsigned NOT NULL,
  `roleId` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_role` (`userId`,`roleId`),
  KEY `fk_user_role_role` (`roleId`),
  CONSTRAINT `fk_user_role_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_role_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `firstName` varchar(255) NOT NULL,
  `lastName` varchar(255) NOT NULL,
  `phoneNumber` varchar(20) DEFAULT NULL,
  `dateOfBirth` date DEFAULT NULL,
  `gender` enum('MALE','FEMALE','OTHER') DEFAULT NULL,
  `avatar` text,
  `country` varchar(100) DEFAULT NULL,
  `isVerified` tinyint(1) NOT NULL DEFAULT '0',
  `isActive` tinyint(1) NOT NULL DEFAULT '0',
  `googleId` varchar(255) DEFAULT NULL,
  `provider` enum('LOCAL','GOOGLE') NOT NULL DEFAULT 'LOCAL',
  `lastLogin` timestamp NULL DEFAULT NULL,
  `isDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `deletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

DROP VIEW IF EXISTS `view_rooms`;

CREATE OR REPLACE VIEW `view_rooms` AS
SELECT 
  r.`id`,
  r.`name`,
  r.`price`,
  r.`street`,
  CONCAT_WS(', ',
    r.`street`,
    w.`name`,
    d.`name`,
    p.`name`,
    c.`name`
  ) AS `fullAddress`,
  r.`hostId`,
  r.`status`,
  r.`createdAt`
FROM `rooms` r
LEFT JOIN `location_wards` w ON w.`id` = r.`wardId`
LEFT JOIN `location_districts` d ON d.`id` = r.`districtId`
LEFT JOIN `location_provinces` p ON p.`id` = r.`provinceId`
LEFT JOIN `location_countries` c ON c.`id` = r.`countryId`;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;