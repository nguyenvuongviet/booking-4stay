"use client";

import { useToast } from "@/components/ui/use-toast";
import { deleteRoom, getAllRooms } from "@/services/admin/roomsApi";
import { Room } from "@/types/room";
import { useCallback, useEffect, useMemo, useState } from "react";

export function useRooms() {
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minCapacity, setMinCapacity] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllRooms();
      setRooms(res.items);
      setError(null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách phòng";

      toast({
        variant: "destructive",
        title: "Lỗi tải dữ liệu",
        description: msg,
      });
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xoá phòng này?")) return;
    try {
      await deleteRoom(id);

      toast({ variant: "success", title: "Đã xoá phòng thành công" });

      setRooms((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Xoá phòng thất bại",
        description:
          err?.response?.data?.message || err?.message || "Vui lòng thử lại",
      });
    }
  };

  const filteredRooms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    let result = rooms.filter((room) => {
      const matchesSearch =
        !q ||
        room.name.toLowerCase().includes(q) ||
        room.location?.fullAddress?.toLowerCase()?.includes(q);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "available" && room.status === "AVAILABLE") ||
        (statusFilter === "booked" && room.status === "BOOKED") ||
        (statusFilter === "maintenance" && room.status === "MAINTENANCE");

      const matchesPrice =
        (!minPrice || room.price >= minPrice) &&
        (!maxPrice || room.price <= maxPrice);

      const totalCapacity = room.adultCapacity + (room.childCapacity || 0);
      const matchesCapacity = !minCapacity || totalCapacity >= minCapacity;

      const matchesRating = !minRating || (room.rating ?? 0) >= minRating;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesPrice &&
        matchesCapacity &&
        matchesRating
      );
    });

    switch (sortBy) {
      case "priceAsc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "ratingDesc":
        result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "capacityDesc":
        result.sort(
          (a, b) =>
            b.adultCapacity +
            (b.childCapacity || 0) -
            (a.adultCapacity + (a.childCapacity || 0))
        );
        break;
    }

    return result;
  }, [
    rooms,
    searchTerm,
    statusFilter,
    sortBy,
    minPrice,
    maxPrice,
    minCapacity,
    minRating,
  ]);

  return {
    loading,
    error,
    rooms: filteredRooms,

    fetchRooms,
    handleDelete,

    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    minCapacity,
    setMinCapacity,
    minRating,
    setMinRating,
  };
}
