"use client";

import { useToast } from "@/components/ui/use-toast";
import {
  deleteRoom,
  getBookingsByRoomId,
  getReviewsByRoomId,
  getRoomById,
} from "@/services/admin/roomsApi";
import { Room } from "@/types/room";
import { useCallback, useEffect, useState } from "react";

export function useRoomDetail(id: number, onDeleted?: () => void) {
  const { toast } = useToast();

  const [room, setRoom] = useState<Room | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const [r, b, rv] = await Promise.all([
        getRoomById(id),
        getBookingsByRoomId(id),
        getReviewsByRoomId(id),
      ]);

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
    loading,
    reload: load,
    handleDelete,
  };
}
