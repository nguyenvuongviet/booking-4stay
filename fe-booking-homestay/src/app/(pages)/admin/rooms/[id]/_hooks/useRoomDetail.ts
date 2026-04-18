"use client";

import { useToast } from "@/_components/ui/use-toast";
import {
  deleteRoom,
  getBookingsByRoomId,
  getReviewsByRoomId,
  getRoomById,
} from "@/services/admin/roomsApi";
import { get_unavailable_dates } from "@/services/bookingApi";
import { Booking } from "@/types/booking";
import { Review } from "@/types/review";
import { Room } from "@/types/room";
import { set } from "date-fns";
import { useCallback, useEffect, useState } from "react";

export function useRoomDetail(id: number, onDeleted?: () => void) {
  const { toast } = useToast();

  const [room, setRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [soldOutDates, setSoldOutDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [roomPrices, setRoomPrices] = useState<{ date: string; price: number }[]>([]);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [r, b, rv] = await Promise.all([
        getRoomById(id),
        getBookingsByRoomId(id),
        getReviewsByRoomId(id),
      ]);
      const dataDate = await get_unavailable_dates(id);

      setSoldOutDates(dataDate);
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
  }, [id, toast]);

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
    reload: load,
    handleDelete,
  };
}
