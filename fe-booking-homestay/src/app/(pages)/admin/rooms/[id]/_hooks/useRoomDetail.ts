"use client";

import { useToast } from "@/_components/ui/use-toast";
import {
  deleteRoom,
  getBookingsByRoomId,
  getReviewsByRoomId,
  getRoomById,
  getRoomCalendar,
} from "@/services/admin/roomsApi";
import { Booking } from "@/types/booking";
import { Review } from "@/types/review";
import { Room } from "@/types/room";
import { useCallback, useEffect, useState } from "react";

export function useRoomDetail(id: number, onDeleted?: () => void) {
  const { toast } = useToast();

  const [room, setRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [soldOutDates, setSoldOutDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomPrices, setRoomPrices] = useState<
    { date: string; price: number }[]
  >([]);

  // Hàm tải toàn bộ dữ liệu liên quan đến phòng
  const load = useCallback(
    async (isSilent = false) => {
      try {
        if (!isSilent) {
          setLoading(true);
        }

        // 1. Tải song song: Thông tin phòng, danh sách đặt phòng và đánh giá
        const [r, b, rv] = await Promise.all([
          getRoomById(id),
          getBookingsByRoomId(id),
          getReviewsByRoomId(id),
        ]);

        // 2. Tải dữ liệu lịch của tháng hiện tại
        const now = new Date();
        try {
          const calendarData = await getRoomCalendar(
            id,
            now.getMonth() + 1,
            now.getFullYear(),
          );

          // Trích xuất các mức giá tùy chỉnh (những ngày có giá khác với giá mặc định của phòng)
          const prices = calendarData.calendar
            .filter((day) => day.price !== Number(r.price))
            .map((day) => ({ date: day.date, price: day.price }));

          // Trích xuất danh sách các ngày đã bị khóa (Sold out/Blocked)
          const blocked = calendarData.calendar
            .filter((day) => day.status === "BLOCKED")
            .map((day) => new Date(day.date));

          setRoomPrices(prices);
          setSoldOutDates(blocked);
        } catch {
          // Nếu API lịch lỗi (có thể do chưa có dữ liệu), mặc định là trống
          setRoomPrices([]);
          setSoldOutDates([]);
        }

        // Cập nhật các state chính
        setRoom(r);
        setBookings(b);
        setReviews(rv);
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Không thể tải thông tin phòng",
          description: err?.response?.data?.message || err.message,
        });
      } finally {
        setLoading(false);
      }
    },
    [id, toast],
  );

  const handleDelete = async () => {
    if (!confirm("Bạn chắc chắn muốn xoá phòng này?")) return;
    try {
      await deleteRoom(id);
      toast({ variant: "success", title: "Đã xoá phòng thành công" });
      onDeleted?.();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Xoá thất bại",
        description: err?.response?.data?.message,
      });
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  return {
    room,
    bookings,
    reviews,
    soldOutDates,
    roomPrices,
    loading,
    reload: () => load(true),
    handleDelete,
  };
}
