-- CreateTable
CREATE TABLE `amenities` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) NULL,
    `category` ENUM('BASIC', 'BATHROOM', 'BEDROOM', 'COMMON') NOT NULL DEFAULT 'BASIC',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_amenity_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `app_configs` (
    `key` VARCHAR(100) NOT NULL,
    `value` JSON NOT NULL,
    `description` VARCHAR(500) NULL,
    `updatedBy` INTEGER UNSIGNED NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_app_configs_key`(`key`),
    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bookings` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NOT NULL,
    `roomId` INTEGER UNSIGNED NOT NULL,
    `guestFullName` VARCHAR(100) NOT NULL,
    `guestEmail` VARCHAR(100) NOT NULL,
    `guestPhoneNumber` VARCHAR(20) NOT NULL,
    `specialRequest` VARCHAR(500) NULL,
    `checkIn` DATE NOT NULL,
    `checkOut` DATE NOT NULL,
    `adults` INTEGER UNSIGNED NOT NULL,
    `children` INTEGER UNSIGNED NULL DEFAULT 0,
    `rawTotalPrice` DECIMAL(12, 2) NOT NULL,
    `discountAmount` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `totalPrice` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('PENDING', 'PARTIALLY_PAID', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED', 'WAITING_REFUND', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `paymentMethod` ENUM('VNPAY', 'CASH', 'BANK_TRANSFER') NOT NULL DEFAULT 'CASH',
    `paidAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `isReview` BOOLEAN NOT NULL DEFAULT false,
    `cancelReason` VARCHAR(255) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_booking_room`(`roomId`),
    INDEX `idx_bookings_isDeleted`(`isDeleted`),
    INDEX `idx_bookings_user_room`(`userId`, `roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contacts` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NULL,
    `fullName` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    INDEX `fk_contact_user`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `levels` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `minPoints` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `discountPercent` DECIMAL(5, 2) NOT NULL DEFAULT 0.00,
    `maxDiscountAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `description` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_level_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loyalty_program` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NOT NULL,
    `levelId` INTEGER UNSIGNED NOT NULL,
    `totalBookings` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `totalNights` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `points` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `lastUpgradeDate` TIMESTAMP(0) NULL,

    UNIQUE INDEX `uq_loyalty_user`(`userId`),
    INDEX `fk_loyalty_level`(`levelId`),
    INDEX `idx_loyalty_user_level`(`userId`, `levelId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_codes` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NULL,
    `email` VARCHAR(255) NOT NULL,
    `otp` VARCHAR(10) NOT NULL,
    `expiresAt` TIMESTAMP(0) NOT NULL,
    `isUsed` BOOLEAN NOT NULL DEFAULT false,

    INDEX `fk_otp_user`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_methods` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` VARCHAR(255) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `uq_payment_method_name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER UNSIGNED NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `txnRef` VARCHAR(64) NOT NULL,
    `transactionNo` VARCHAR(64) NULL,
    `transactionDate` VARCHAR(20) NULL,
    `bankCode` VARCHAR(20) NULL,
    `cardType` VARCHAR(50) NULL,
    `paymentGateway` VARCHAR(50) NOT NULL DEFAULT 'VNPAY',
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `rawData` JSON NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uniq_txnRef`(`txnRef`),
    UNIQUE INDEX `uniq_transactionNo`(`transactionNo`),
    INDEX `idx_booking`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER UNSIGNED NOT NULL,
    `userId` INTEGER UNSIGNED NOT NULL,
    `rating` DECIMAL(2, 1) NULL,
    `comment` VARCHAR(1000) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `bookingId`(`bookingId`),
    INDEX `fk_review_user`(`userId`),
    INDEX `idx_reviews_rating`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `roles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `name`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_amenities` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER UNSIGNED NOT NULL,
    `amenityId` INTEGER UNSIGNED NOT NULL,

    INDEX `fk_room_amenity_amenity`(`amenityId`),
    UNIQUE INDEX `uq_room_amenity`(`roomId`, `amenityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_availability` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER UNSIGNED NOT NULL,
    `date` DATE NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,

    INDEX `idx_room_availability_date`(`date`),
    UNIQUE INDEX `uq_room_availability`(`roomId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_beds` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER UNSIGNED NOT NULL,
    `type` ENUM('SINGLE', 'DOUBLE', 'QUEEN', 'KING', 'SOFA_BED', 'BUNK_BED') NOT NULL,
    `quantity` INTEGER UNSIGNED NOT NULL DEFAULT 1,

    INDEX `fk_room_bed_room`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_images` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER UNSIGNED NOT NULL,
    `imageUrl` VARCHAR(255) NOT NULL,
    `isMain` BOOLEAN NOT NULL DEFAULT false,
    `position` INTEGER NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_room_image_room`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `room_prices` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER UNSIGNED NOT NULL,
    `date` DATE NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,

    INDEX `idx_room_price_date`(`date`),
    UNIQUE INDEX `uq_room_price`(`roomId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rooms` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `hostId` INTEGER UNSIGNED NOT NULL,
    `countryId` INTEGER UNSIGNED NULL DEFAULT 1,
    `provinceId` INTEGER UNSIGNED NOT NULL,
    `districtId` INTEGER UNSIGNED NOT NULL,
    `wardId` INTEGER UNSIGNED NULL,
    `street` VARCHAR(255) NULL,
    `fullAddress` VARCHAR(255) NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `adultCapacity` INTEGER UNSIGNED NOT NULL,
    `childCapacity` INTEGER UNSIGNED NOT NULL DEFAULT 0,
    `status` ENUM('AVAILABLE', 'BOOKED', 'MAINTENANCE') NULL DEFAULT 'AVAILABLE',
    `rating` DECIMAL(2, 1) NULL DEFAULT 0.0,
    `reviewCount` INTEGER UNSIGNED NULL DEFAULT 0,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `fk_room_country`(`countryId`),
    INDEX `fk_room_district`(`districtId`),
    INDEX `fk_room_host`(`hostId`),
    INDEX `fk_room_ward`(`wardId`),
    INDEX `idx_rooms_location`(`provinceId`, `districtId`, `wardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_roles` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `userId` INTEGER UNSIGNED NOT NULL,
    `roleId` INTEGER UNSIGNED NOT NULL,

    INDEX `fk_user_role_role`(`roleId`),
    UNIQUE INDEX `uq_user_role`(`userId`, `roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NULL,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(20) NULL,
    `dateOfBirth` DATE NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `avatar` TEXT NULL,
    `country` VARCHAR(100) NULL,
    `isVerified` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT false,
    `googleId` VARCHAR(255) NULL,
    `provider` ENUM('LOCAL', 'GOOGLE') NOT NULL DEFAULT 'LOCAL',
    `lastLogin` TIMESTAMP(0) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `email`(`email`),
    INDEX `idx_users_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_countries` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `code` CHAR(2) NOT NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `code`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_districts` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `provinceId` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_location_district_name`(`provinceId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_provinces` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `countryId` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NULL,
    `imageUrl` VARCHAR(255) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_location_province_name`(`name`),
    INDEX `fk_province_country`(`countryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `location_wards` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `districtId` INTEGER UNSIGNED NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `code` VARCHAR(20) NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` TIMESTAMP(0) NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `uq_location_ward_name`(`districtId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refunds` (
    `id` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `paymentId` INTEGER UNSIGNED NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `createdBy` INTEGER UNSIGNED NOT NULL,
    `reason` VARCHAR(255) NULL,
    `requestId` VARCHAR(50) NULL,
    `transactionType` VARCHAR(10) NULL,
    `rspCode` VARCHAR(10) NULL,
    `rspMessage` VARCHAR(255) NULL,
    `transactionDate` DATETIME(0) NULL,
    `rawData` JSON NULL,
    `createdAt` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `idx_paymentId`(`paymentId`),
    INDEX `fk_refunds_createdBy`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `contacts` ADD CONSTRAINT `contacts_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `loyalty_program` ADD CONSTRAINT `loyalty_program_ibfk_2` FOREIGN KEY (`levelId`) REFERENCES `levels`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `loyalty_program` ADD CONSTRAINT `loyalty_program_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `otp_codes` ADD CONSTRAINT `otp_codes_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`bookingId`) REFERENCES `bookings`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_ibfk_2` FOREIGN KEY (`amenityId`) REFERENCES `amenities`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `room_amenities` ADD CONSTRAINT `room_amenities_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `room_availability` ADD CONSTRAINT `room_availability_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `room_beds` ADD CONSTRAINT `room_beds_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `room_images` ADD CONSTRAINT `room_images_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `room_prices` ADD CONSTRAINT `room_prices_ibfk_1` FOREIGN KEY (`roomId`) REFERENCES `rooms`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `fk_room_country` FOREIGN KEY (`countryId`) REFERENCES `location_countries`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `fk_room_district` FOREIGN KEY (`districtId`) REFERENCES `location_districts`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`hostId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `fk_room_province` FOREIGN KEY (`provinceId`) REFERENCES `location_provinces`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `rooms` ADD CONSTRAINT `fk_room_ward` FOREIGN KEY (`wardId`) REFERENCES `location_wards`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`roleId`) REFERENCES `roles`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `location_districts` ADD CONSTRAINT `fk_district_province` FOREIGN KEY (`provinceId`) REFERENCES `location_provinces`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `location_provinces` ADD CONSTRAINT `fk_province_country` FOREIGN KEY (`countryId`) REFERENCES `location_countries`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `location_wards` ADD CONSTRAINT `fk_ward_district` FOREIGN KEY (`districtId`) REFERENCES `location_districts`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `fk_refund_payment` FOREIGN KEY (`paymentId`) REFERENCES `payments`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `fk_refunds_createdBy` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
