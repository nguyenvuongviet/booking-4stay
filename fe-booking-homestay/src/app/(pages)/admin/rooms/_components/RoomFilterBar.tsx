"use client";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Search, Star, Users, X } from "lucide-react";

export function RoomFilterBar(props: any) {
  const {
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
  } = props;

  return (
    <Card className="p-3 border-warm-200">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-60 max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tên hoặc địa chỉ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[140px]">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-md px-2 py-1.5 text-sm"
          >
            <option value="all">Tất cả</option>
            <option value="available">Có sẵn</option>
            <option value="booked">Đã đặt</option>
            <option value="maintenance">Bảo trì</option>
          </select>
        </div>

        <div className="flex items-center gap-2 border-l pl-3">
          <span className="text-xs text-muted-foreground">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border rounded-md px-2 py-1.5 text-sm"
          >
            <option value="default">Mặc định</option>
            <option value="priceAsc">Giá ↑</option>
            <option value="priceDesc">Giá ↓</option>
            <option value="ratingDesc">Đánh giá cao</option>
            <option value="capacityDesc">Sức chứa lớn</option>
          </select>
        </div>

        <div className="flex items-center gap-1 border-l pl-3">
          <span className="text-xs text-muted-foreground">Giá:</span>
          <Input
            type="number"
            placeholder="Từ"
            className="w-20 h-9 text-sm"
            value={minPrice ?? ""}
            onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
          />
          <span>-</span>
          <Input
            type="number"
            placeholder="Đến"
            className="w-20 h-9 text-sm"
            value={maxPrice ?? ""}
            onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
          />
        </div>

        <div className="flex items-center gap-2 border-l pl-3">
          <Users className="w-4 h-4" />
          <Input
            type="number"
            placeholder="≥ Khách"
            className="w-24 h-9 text-sm"
            value={minCapacity ?? ""}
            onChange={(e) => setMinCapacity(Number(e.target.value) || 0)}
          />
        </div>

        <div className="flex items-center gap-2 border-l pl-3">
          <Star className="w-4 h-4 text-yellow-500" />
          <Input
            type="number"
            placeholder="≥ Sao"
            className="w-20 h-9 text-sm"
            value={minRating ?? ""}
            onChange={(e) => setMinRating(Number(e.target.value) || 0)}
          />
        </div>

        <div className="border-l pl-3 ml-auto">
          <button
            className="p-2 text-muted-foreground hover:text-red-500"
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setSortBy("default");
              setMinPrice(null);
              setMaxPrice(null);
              setMinCapacity(null);
              setMinRating(null);
            }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
}
