"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Search, SlidersHorizontal, Users, X } from "lucide-react";
import { useState } from "react";

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

  const [showAdvanced, setShowAdvanced] = useState(false);

  const hasActiveFilters =
    searchTerm ||
    statusFilter !== "all" ||
    sortBy !== "default" ||
    minPrice !== null ||
    maxPrice !== null ||
    minCapacity !== null ||
    minRating !== null;

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("default");
    setMinPrice(null);
    setMaxPrice(null);
    setMinCapacity(null);
    setMinRating(null);
  };

  return (
    <div className="sticky top-16 sm:top-20 z-20 -mx-4 px-4 py-2.5 sm:-mx-6 sm:px-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800 transition-all duration-300">
      <Card className="p-2 sm:p-3 border border-slate-200/80 dark:border-slate-800/80 shadow-2xs bg-white/95 dark:bg-slate-900/95">
        <div className="flex flex-col gap-3">
          {/* Main search and filter toggle row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm kiếm tên hoặc địa chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9.5 h-9.5 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-primary/20"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Toggle Advanced Button */}
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`h-9.5 gap-1.5 px-3 rounded-xl text-xs sm:text-sm font-medium border-slate-200/80 cursor-pointer ${
                showAdvanced
                  ? "bg-primary/5 text-primary border-primary/30"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Bộ lọc</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
              )}
            </Button>

            {/* Reset Button (Desktop) */}
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={handleReset}
                className="h-9.5 gap-1 px-2.5 rounded-xl text-xs sm:text-sm font-medium text-red-500 hover:bg-red-50/50 hover:text-red-600 hidden xs:flex cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Xoá lọc</span>
              </Button>
            )}
          </div>

          {/* Advanced filters collapsible */}
          {showAdvanced && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              {/* Status */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Trạng thái
                </span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1.5 text-xs sm:text-sm outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="available">Có sẵn</option>
                  <option value="booked">Đã đặt</option>
                  <option value="maintenance">Bảo trì</option>
                </select>
              </div>

              {/* Sắp xếp */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Sắp xếp
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1.5 text-xs sm:text-sm outline-none focus:border-primary/50 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
                >
                  <option value="default">Mặc định</option>
                  <option value="priceAsc">Giá tăng dần ↑</option>
                  <option value="priceDesc">Giá giảm dần ↓</option>
                  <option value="ratingDesc">Đánh giá tốt nhất</option>
                  <option value="capacityDesc">Sức chứa lớn nhất</option>
                </select>
              </div>

              {/* Khoảng giá */}
              <div className="flex flex-col gap-1 sm:col-span-2 md:col-span-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Khoảng giá (₫)
                </span>
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    placeholder="Từ"
                    value={minPrice ?? ""}
                    onChange={(e) =>
                      setMinPrice(
                        e.target.value !== "" ? Number(e.target.value) : null,
                      )
                    }
                    className="h-9.5 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-primary/20"
                  />
                  <span className="text-slate-400 text-xs">-</span>
                  <Input
                    type="number"
                    placeholder="Đến"
                    value={maxPrice ?? ""}
                    onChange={(e) =>
                      setMaxPrice(
                        e.target.value !== "" ? Number(e.target.value) : null,
                      )
                    }
                    className="h-9.5 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              {/* Sức chứa */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Sức chứa tối thiểu
                </span>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="number"
                    placeholder="Số khách"
                    value={minCapacity ?? ""}
                    onChange={(e) =>
                      setMinCapacity(
                        e.target.value !== "" ? Number(e.target.value) : null,
                      )
                    }
                    className="pl-9.5 h-9.5 text-xs sm:text-sm rounded-xl border-slate-200 focus-visible:ring-primary/20"
                  />
                </div>
              </div>

              {/* Đánh giá sao */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] sm:text-xs text-slate-400 font-semibold uppercase tracking-wider">
                  Đánh giá tối thiểu
                </span>
                <select
                  value={minRating ?? "all"}
                  onChange={(e) =>
                    setMinRating(
                      e.target.value !== "all" ? Number(e.target.value) : null,
                    )
                  }
                  className="w-full h-9.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent px-3 py-1.5 text-xs sm:text-sm outline-none focus:border-primary/50 text-slate-700 dark:text-slate-350 font-medium cursor-pointer"
                >
                  <option value="all">Tất cả sao</option>
                  <option value="5">5 Sao ⭐</option>
                  <option value="4">≥ 4 Sao ⭐</option>
                  <option value="3">≥ 3 Sao ⭐</option>
                  <option value="2">≥ 2 Sao ⭐</option>
                  <option value="1">≥ 1 Sao ⭐</option>
                </select>
              </div>
            </div>
          )}

          {/* Reset button for mobile */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={handleReset}
              className="h-9 gap-1 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50/50 hover:text-red-600 xs:hidden w-full border border-dashed border-red-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xoá bộ lọc đang chọn</span>
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
