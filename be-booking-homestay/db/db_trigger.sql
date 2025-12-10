DELIMITER $$

/* ==========================================================
    PROCEDURE: Recompute Room Rating & Review Count
   ========================================================== */
DROP PROCEDURE IF EXISTS `recompute_room_rating` $$
CREATE PROCEDURE `recompute_room_rating`(IN p_roomId INT UNSIGNED)
BEGIN
  IF p_roomId IS NOT NULL THEN
    UPDATE `rooms` r
    SET 
      r.`rating` = (
        SELECT IFNULL(ROUND(AVG(rv.rating), 1), 0)
        FROM `reviews` rv
        JOIN `bookings` b ON rv.`bookingId` = b.`id`
        WHERE b.`roomId` = r.`id`
      ),
      r.reviewCount = (
        SELECT COUNT(*)
        FROM `reviews` rv
        JOIN `bookings` b ON rv.`bookingId` = b.`id`
        WHERE b.`roomId` = r.`id`
      )
    WHERE r.`id` = p_roomId;
  END IF;
END $$


/* ==========================================================
    TRIGGER : Auto-generate fullAddress for `rooms`
   ========================================================== */

-- After INSERT on `rooms`
DROP TRIGGER IF EXISTS `trg_rooms_fullAddress_insert` $$
CREATE TRIGGER `trg_rooms_fullAddress_insert`
BEFORE INSERT ON `rooms`
FOR EACH ROW
BEGIN
  SET NEW.`fullAddress` = CONCAT_WS(', ',
    NEW.`street`,
    (SELECT name FROM `location_wards` WHERE `id` = NEW.`wardId`),
    (SELECT name FROM `location_districts` WHERE `id` = NEW.`districtId`),
    (SELECT name FROM `location_provinces` WHERE `id` = NEW.`provinceId`),
    (SELECT name FROM `location_countries` WHERE `id` = NEW.`countryId`)
  );
END $$

DROP TRIGGER IF EXISTS `trg_country_name_update` $$
CREATE TRIGGER `trg_country_name_update`
AFTER UPDATE ON `location_countries`
FOR EACH ROW
BEGIN
  IF NEW.`name` <> OLD.`name` THEN
    UPDATE `rooms`
    SET `fullAddress` = CONCAT_WS(', ',
      `street`,
      (SELECT `name` FROM `location_wards` WHERE `id` = `rooms`.`wardId`),
      (SELECT `name` FROM `location_districts` WHERE `id` = `rooms`.`districtId`),
      (SELECT `name` FROM `location_provinces` WHERE `id` = `rooms`.`provinceId`),
      NEW.`name`
    )
    WHERE `countryId` = NEW.`id`;
  END IF;
END $$

DROP TRIGGER IF EXISTS `trg_province_name_update` $$
CREATE TRIGGER `trg_province_name_update`
AFTER UPDATE ON `location_provinces`
FOR EACH ROW
BEGIN
  IF NEW.`name` <> OLD.`name` THEN
    UPDATE `rooms`
    SET `fullAddress` = CONCAT_WS(', ',
      `street`,
      (SELECT `name` FROM `location_wards` WHERE `id` = `rooms`.`wardId`),
      (SELECT `name` FROM `location_districts` WHERE `id` = `rooms`.`districtId`),
      NEW.`name`,
      (SELECT `name` FROM `location_countries` WHERE `id` = `rooms`.`countryId`)
    )
    WHERE `provinceId` = NEW.`id`;
  END IF;
END $$

DROP TRIGGER IF EXISTS `trg_district_name_update` $$
CREATE TRIGGER `trg_district_name_update`
AFTER UPDATE ON `location_districts`
FOR EACH ROW
BEGIN
  IF NEW.`name` <> OLD.`name` THEN
    UPDATE `rooms`
    SET `fullAddress` = CONCAT_WS(', ',
      `street`,
      (SELECT `name` FROM `location_wards` WHERE `id` = `rooms`.`wardId`),
      NEW.`name`,
      (SELECT `name` FROM `location_provinces` WHERE `id` = `rooms`.`provinceId`),
      (SELECT `name` FROM `location_countries` WHERE `id` = `rooms`.`countryId`)
    )
    WHERE `districtId` = NEW.`id`;
  END IF;
END $$

DROP TRIGGER IF EXISTS `trg_ward_name_update` $$
CREATE TRIGGER `trg_ward_name_update`
AFTER UPDATE ON `location_wards`
FOR EACH ROW
BEGIN
  IF NEW.`name` <> OLD.`name` THEN
    UPDATE `rooms`
    SET `fullAddress` = CONCAT_WS(', ',
      `street`,
      NEW.`name`,
      (SELECT `name` FROM `location_districts` WHERE `id` = `rooms`.`districtId`),
      (SELECT `name` FROM `location_provinces` WHERE `id` = `rooms`.`provinceId`),
      (SELECT `name` FROM `location_countries` WHERE `id` = `rooms`.`countryId`)
    )
    WHERE `wardId` = NEW.`id`;
  END IF;
END $$


-- After UPDATE on `rooms`
DROP TRIGGER IF EXISTS `trg_rooms_fullAddress_update` $$
CREATE TRIGGER `trg_rooms_fullAddress_update`
BEFORE UPDATE ON `rooms`
FOR EACH ROW
BEGIN
  -- Chỉ chạy nếu có bất kỳ trường địa chỉ nào thay đổi (Tùy chọn: tối ưu hóa hiệu suất)
  IF 
    NEW.`street` <> OLD.`street` OR
    NEW.`wardId` <> OLD.`wardId` OR
    NEW.`districtId` <> OLD.`districtId` OR
    NEW.`provinceId` <> OLD.`provinceId` OR
    NEW.`countryId` <> OLD.`countryId` 
  THEN
    -- Lấy tên vị trí và ghép lại
    SET NEW.`fullAddress` = CONCAT_WS(', ',
      NEW.`street`,
      (SELECT name FROM `location_wards` WHERE `id` = NEW.`wardId`),
      (SELECT name FROM `location_districts` WHERE `id` = NEW.`districtId`),
      (SELECT name FROM `location_provinces` WHERE `id` = NEW.`provinceId`),
      (SELECT name FROM `location_countries` WHERE `id` = NEW.`countryId`)
    );
  END IF;
END $$


/* ==========================================================
    TRIGGERS: Update Room Rating when Review changes
   ========================================================== */

-- After INSERT on reviews
DROP TRIGGER IF EXISTS `trg_reviews_after_insert` $$
CREATE TRIGGER `trg_reviews_after_insert`
AFTER INSERT ON `reviews`
FOR EACH ROW
BEGIN
  DECLARE v_roomId INT UNSIGNED;
  SELECT `roomId` INTO v_roomId FROM `bookings` WHERE `id` = NEW.`bookingId`;
  CALL `recompute_room_rating`(v_roomId);
END $$

-- After UPDATE on reviews
DROP TRIGGER IF EXISTS `trg_reviews_after_update` $$
CREATE TRIGGER `trg_reviews_after_update`
AFTER UPDATE ON `reviews`
FOR EACH ROW
BEGIN
  DECLARE v_roomId INT UNSIGNED;
  SELECT `roomId` INTO v_roomId FROM `bookings` WHERE `id` = NEW.`bookingId`;
  CALL `recompute_room_rating`(v_roomId);
END $$

-- After DELETE on reviews
DROP TRIGGER IF EXISTS `trg_reviews_after_delete` $$
CREATE TRIGGER `trg_reviews_after_delete`
AFTER DELETE ON `reviews`
FOR EACH ROW
BEGIN
  DECLARE v_roomId INT UNSIGNED;
  SELECT `roomId` INTO v_roomId FROM `bookings` WHERE `id` = OLD.`bookingId`;
  CALL `recompute_room_rating`(v_roomId);
END $$


/* ==========================================================
    TRIGGER: Loyalty Program Update on CHECKED_OUT
   ========================================================== */
DROP TRIGGER IF EXISTS `trg_booking_after_update_loyalty` $$
CREATE TRIGGER `trg_booking_after_update_loyalty`
AFTER UPDATE ON `bookings`
FOR EACH ROW
BEGIN
  IF NEW.`status` = 'CHECKED_OUT' AND OLD.`status` <> 'CHECKED_OUT' THEN
    UPDATE `loyalty_program`
    SET 
      `totalBookings` = `totalBookings` + 1,
      `totalNights` = `totalNights` + DATEDIFF(NEW.`checkOut`, NEW.`checkIn`),
      `points` = `points` + ROUND(NEW.`totalPrice` / 1000, 0),
      `lastUpgradeDate` = NOW()
    WHERE `userId` = NEW.`userId`;
  END IF;
END $$

DELIMITER ;