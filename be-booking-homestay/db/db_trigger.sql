-- =====================================
-- Triggers & Stored Procedures
-- =====================================
DELIMITER $$

-- Procedure: Recompute room rating & review count
DROP PROCEDURE IF EXISTS recompute_room_rating $$
CREATE PROCEDURE recompute_room_rating(IN p_roomId INT)
BEGIN
  IF p_roomId IS NOT NULL THEN
    UPDATE rooms r
    SET 
      r.rating = (
        SELECT IFNULL(ROUND(AVG(rv.rating), 1), 0)
        FROM reviews rv
        JOIN bookings b ON rv.bookingId = b.id
        WHERE b.roomId = r.id
      ),
      r.reviewCount = (
        SELECT COUNT(*)
        FROM reviews rv
        JOIN bookings b ON rv.bookingId = b.id
        WHERE b.roomId = r.id
      )
    WHERE r.id = p_roomId;
  END IF;
END $$

-- Trigger: After INSERT on reviews
DROP TRIGGER IF EXISTS trg_reviews_after_insert $$
CREATE TRIGGER trg_reviews_after_insert
AFTER INSERT ON reviews
FOR EACH ROW
BEGIN
  DECLARE v_roomId INT;
  SELECT roomId INTO v_roomId FROM bookings WHERE id = NEW.bookingId;
  CALL recompute_room_rating(v_roomId);
END $$

-- Trigger: After UPDATE on reviews
DROP TRIGGER IF EXISTS trg_reviews_after_update $$
CREATE TRIGGER trg_reviews_after_update
AFTER UPDATE ON reviews
FOR EACH ROW
BEGIN
  DECLARE v_old_roomId INT;
  DECLARE v_new_roomId INT;

  SELECT roomId INTO v_old_roomId FROM bookings WHERE id = OLD.bookingId;
  SELECT roomId INTO v_new_roomId FROM bookings WHERE id = NEW.bookingId;

  CALL recompute_room_rating(v_old_roomId);

  IF v_new_roomId IS NOT NULL AND v_new_roomId <> v_old_roomId THEN
    CALL recompute_room_rating(v_new_roomId);
  END IF;
END $$

-- Trigger: After DELETE on reviews
DROP TRIGGER IF EXISTS trg_reviews_after_delete $$
CREATE TRIGGER trg_reviews_after_delete
AFTER DELETE ON reviews
FOR EACH ROW
BEGIN
  DECLARE v_roomId INT;
  SELECT roomId INTO v_roomId FROM bookings WHERE id = OLD.bookingId;
  CALL recompute_room_rating(v_roomId);
END $$

DELIMITER ;
