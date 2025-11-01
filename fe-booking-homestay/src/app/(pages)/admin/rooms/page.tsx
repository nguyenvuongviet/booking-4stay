"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Trash2,
  RefreshCcw,
  Star,
  MapPin,
  Users,
  Image as ImageIcon,
  X,
  User,
  Baby,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { RoomFormModal } from "@/components/admin/room-form-modal";

import type { Room } from "@/types/room";
import { getAllRooms, deleteRoom } from "@/services/admin/roomsApi";
import { formatDate } from "@/lib/utils/date";

export default function RoomsPage() {
  const { toast } = useToast();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [minCapacity, setMinCapacity] = useState<number | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const [openRoomModal, setOpenRoomModal] = useState(false);

  // Fetch danh sách phòng
  async function fetchRooms() {
    try {
      setLoading(true);
      setError(null);
      const res = await getAllRooms();
      setRooms(res.items);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách phòng";
      setError(msg);
      toast({
        variant: "destructive",
        title: "Lỗi tải dữ liệu",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  // Lọc và sắp xếp
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

    // Sắp xếp
    switch (sortBy) {
      case "priceAsc":
        result = result.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        result = result.sort((a, b) => b.price - a.price);
        break;
      case "ratingDesc":
        result = result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "capacityDesc":
        result = result.sort(
          (a, b) =>
            b.adultCapacity + (b.childCapacity || 0) -
            (a.adultCapacity + (a.childCapacity || 0))
        );
        break;
      default:
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

  // Xoá phòng
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

  const handleRoomSubmit = async (data: any) => {
    console.log("Room data:", data);
    toast({
      variant: "success",
      title: "Thêm phòng thành công",
    });
    setOpenRoomModal(false);
    fetchRooms();
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "AVAILABLE":
        return "bg-green-100 text-green-800";
      case "BOOKED":
        return "bg-blue-100 text-blue-800";
      case "MAINTENANCE":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-warm-900">Quản lý phòng</h1>
          <p className="text-warm-600 mt-1">
            Quản lý toàn bộ danh sách phòng trong hệ thống
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchRooms}>
            <RefreshCcw className="w-4 h-4 mr-1" />
            Làm mới
          </Button>
          <Button onClick={() => setOpenRoomModal(true)}>
            <Plus className="w-4 h-4" />
            Thêm phòng
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card className="p-3 border-warm-200">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tìm kiếm */}
          <div className="relative flex-1 min-w-[240px] max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm tên hoặc địa chỉ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9 text-sm"
            />
          </div>

          {/* Trạng thái */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-warm-200 rounded-md bg-white px-2 py-1.5 text-sm text-warm-900"
            >
              <option value="all">Tất cả</option>
              <option value="available">Có sẵn</option>
              <option value="booked">Đã đặt</option>
              <option value="maintenance">Bảo trì</option>
            </select>
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-2 border-l border-warm-200 pl-3">
            <span className="text-xs text-muted-foreground">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-warm-200 rounded-md bg-white px-2 py-1.5 text-sm text-warm-900"
            >
              <option value="default">Mặc định</option>
              <option value="priceAsc">Giá ↑</option>
              <option value="priceDesc">Giá ↓</option>
              <option value="ratingDesc">Đánh giá cao</option>
              <option value="capacityDesc">Sức chứa lớn</option>
            </select>
          </div>

          {/* Giá */}
          <div className="flex items-center gap-1 border-l border-warm-200 pl-3">
            <span className="text-xs text-muted-foreground">Giá:</span>
            <Input
              type="number"
              min={0}
              placeholder="Từ"
              value={minPrice ?? ""}
              onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
              className="w-20 h-9 text-sm"
            />
            <span className="text-muted-foreground">-</span>
            <Input
              type="number"
              min={0}
              placeholder="Đến"
              value={maxPrice ?? ""}
              onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
              className="w-20 h-9 text-sm"
            />
          </div>

          {/* Sức chứa */}
          <div className="flex items-center gap-2 border-l border-warm-200 pl-3">
            <Users className="w-4 h-4 text-muted-foreground" />
            <Input
              type="number"
              min={1}
              placeholder="≥ Khách"
              value={minCapacity ?? ""}
              onChange={(e) => setMinCapacity(Number(e.target.value) || 0)}
              className="w-24 h-9 text-sm"
            />
          </div>

          {/* Đánh giá */}
          <div className="flex items-center gap-2 border-l border-warm-200 pl-3">
            <Star className="w-4 h-4 text-yellow-500" />
            <Input
              type="number"
              min={0}
              max={5}
              step={0.1}
              placeholder="≥ Sao"
              value={minRating ?? ""}
              onChange={(e) => setMinRating(Number(e.target.value) || 0)}
              className="w-20 h-9 text-sm"
            />
          </div>

          {/* Xoá bộ lọc */}
          <div className="border-l border-warm-200 pl-3 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Xoá bộ lọc"
              onClick={() => {
                setMinPrice(null);
                setMaxPrice(null);
                setMinCapacity(null);
                setMinRating(null);
                setStatusFilter("all");
                setSearchTerm("");
                setSortBy("default");
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading / Error */}
      {loading && (
        <Card className="p-6 border-warm-200">
          <p>Đang tải danh sách phòng...</p>
        </Card>
      )}
      {error && !loading && (
        <Card className="p-6 border-red-200 bg-red-50 text-red-700">
          <p>Lỗi tải dữ liệu: {error}</p>
        </Card>
      )}

      {/* Danh sách phòng */}
      {!loading && !error && (
        <Card className="overflow-hidden border-warm-200">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 p-4">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                className="border rounded-xl shadow-sm hover:shadow-md transition bg-card overflow-hidden"
              >
                <div className="relative w-full h-44 rounded-t-xl overflow-hidden bg-muted/20 flex items-center justify-center">
                  {room.images?.main ? (
                    <>
                      <img
                        src={room.images.main}
                        alt={room.name}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 left-2 bg-black/50 text-white text-xs">
                        Ảnh chính
                      </Badge>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <div className="bg-muted/40 p-3 rounded-full mb-2">
                        <ImageIcon className="w-6 h-6 opacity-70" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="opacity-70 text-xs px-2 py-0.5 pointer-events-none"
                      >
                        Chưa có ảnh
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg text-warm-900 line-clamp-1">
                      {room.name}
                    </h3>
                    <Badge className={getStatusColor(room.status)}>
                      {room.status === "AVAILABLE"
                        ? "Có sẵn"
                        : room.status === "BOOKED"
                        ? "Đã đặt"
                        : "Bảo trì"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {room.description || "Chưa có mô tả"}
                  </p>

                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <Users className="w-4 h-4" />
                    {room.adultCapacity}
                    <Baby className="w-4 h-4 ml-3" />
                    {room.childCapacity || 0}
                  </div>

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {room.location?.street}, {room.location?.ward},{" "}
                      {room.location?.district}, {room.location?.province}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-warm-900 font-semibold">
                      {room.price.toLocaleString()}₫/đêm
                    </span>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-500" />
                      <span className="font-medium">
                        {room.rating ?? 0} ({room.reviewCount ?? 0})
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t">
                    <Link href={`/admin/rooms/${room.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-warm-600 hover:text-warm-800"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Chi tiết
                      </Button>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(room.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {filteredRooms.length === 0 && (
              <p className="col-span-full text-center py-8 text-muted-foreground">
                Không có phòng nào phù hợp.
              </p>
            )}
          </div>
        </Card>
      )}

      <RoomFormModal
        open={openRoomModal}
        onOpenChange={setOpenRoomModal}
        onSubmit={handleRoomSubmit}
      />
    </div>
  );
}
