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
      r.rating = (
        SELECT IFNULL(ROUND(AVG(rv.rating), 1), 0)
        FROM `reviews` rv
        JOIN `bookings` b ON rv.bookingId = b.id
        WHERE b.roomId = r.id
      ),
      r.reviewCount = (
        SELECT COUNT(*)
        FROM `reviews` rv
        JOIN `bookings` b ON rv.bookingId = b.id
        WHERE b.roomId = r.id
      )
    WHERE r.id = p_roomId;
  END IF;
END $$


/* ==========================================================
    TRIGGER: Auto-generate fullAddress on Room INSERT
   ========================================================== */
DROP TRIGGER IF EXISTS `trg_rooms_fullAddress` $$
CREATE TRIGGER `trg_rooms_fullAddress`
BEFORE INSERT ON `rooms`
FOR EACH ROW
BEGIN
  SET NEW.fullAddress = CONCAT_WS(', ',
    NEW.street,
    (SELECT name FROM location_wards WHERE id = NEW.wardId),
    (SELECT name FROM location_districts WHERE id = NEW.districtId),
    (SELECT name FROM location_provinces WHERE id = NEW.provinceId)
  );
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
  SELECT roomId INTO v_roomId FROM `bookings` WHERE id = NEW.bookingId;
  CALL recompute_room_rating(v_roomId);
END $$

-- After UPDATE on reviews
DROP TRIGGER IF EXISTS `trg_reviews_after_update` $$
CREATE TRIGGER `trg_reviews_after_update`
AFTER UPDATE ON `reviews`
FOR EACH ROW
BEGIN
  DECLARE v_roomId INT UNSIGNED;
  SELECT roomId INTO v_roomId FROM `bookings` WHERE id = NEW.bookingId;
  CALL recompute_room_rating(v_roomId);
END $$

-- After DELETE on reviews
DROP TRIGGER IF EXISTS `trg_reviews_after_delete` $$
CREATE TRIGGER `trg_reviews_after_delete`
AFTER DELETE ON `reviews`
FOR EACH ROW
BEGIN
  DECLARE v_roomId INT UNSIGNED;
  SELECT roomId INTO v_roomId FROM `bookings` WHERE id = OLD.bookingId;
  CALL recompute_room_rating(v_roomId);
END $$


/* ==========================================================
    TRIGGER: Loyalty Program Update on CHECKED_OUT
   ========================================================== */
DROP TRIGGER IF EXISTS `trg_booking_after_update_loyalty` $$
CREATE TRIGGER `trg_booking_after_update_loyalty`
AFTER UPDATE ON `bookings`
FOR EACH ROW
BEGIN
  IF NEW.status = 'CHECKED_OUT' AND OLD.status <> 'CHECKED_OUT' THEN
    UPDATE `loyalty_program`
    SET 
      totalBookings = totalBookings + 1,
      totalNights = totalNights + DATEDIFF(NEW.checkOut, NEW.checkIn),
      points = points + ROUND(NEW.totalPrice, 0),
      lastUpgradeDate = NOW()
    WHERE userId = NEW.userId;
  END IF;
END $$

DELIMITER ;

CREATE OR REPLACE VIEW view_rooms AS
SELECT 
  r.id, r.name, r.price, r.street,
  CONCAT_WS(', ',
    r.street,
    w.name,
    d.name,
    p.name
  ) AS fullAddress,
  r.hostId, r.status, r.createdAt
FROM rooms r
LEFT JOIN location_wards w ON w.id = r.wardId
LEFT JOIN location_districts d ON d.id = r.districtId
LEFT JOIN location_provinces p ON p.id = r.provinceId;
