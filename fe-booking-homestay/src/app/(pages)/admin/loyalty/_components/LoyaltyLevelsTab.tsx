"use client";

import { Button } from "@/_components/ui/button";
import { Skeleton } from "@/_components/ui/skeleton";
import {
  getLoyaltyLevels,
  LoyaltyLevel,
  toggleLevelActive,
} from "@/services/admin/loyaltyApi";
import { ChevronDown, ChevronUp, Pencil, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { FancySwitch } from "../../_components/ui/fancy-switch";
import LevelModal from "./LevelModal";
import { RecomputeButton } from "./RecomputeButton";

export default function LoyaltyLevelsTab({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [levels, setLevels] = useState<LoyaltyLevel[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editLevel, setEditLevel] = useState<LoyaltyLevel | null>(null);
  const [loading, setLoading] = useState(true);

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const load = async () => {
    setLoading(true);
    try {
      const data = await getLoyaltyLevels();
      setLevels(data);
    } catch {
      toast.error("Không thể tải danh sách cấp độ");
    } finally {
      setLoading(false);
    }
  };

  const toggleSort = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedLevels = useMemo(() => {
    return [...levels].sort((a, b) => {
      return sortOrder === "asc"
        ? a.minPoints - b.minPoints
        : b.minPoints - a.minPoints;
    });
  }, [levels, sortOrder]);

  const sortedIcon = (order: "asc" | "desc") => {
    if (order === "asc") return <ChevronUp className="w-4 h-4" />;
    return <ChevronDown className="w-4 h-4" />;
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <p className="text-xs sm:text-base text-muted-foreground">
            Quản lý các cấp độ và điều kiện tích điểm của khách hàng.
          </p>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0 justify-end">
            <RecomputeButton onDone={load} />
            <Button
              onClick={() => {
                setEditLevel(null);
                setModalOpen(true);
              }}
              className="text-xs sm:text-sm px-3 sm:px-4 py-2 h-9 sm:h-10 rounded-lg cursor-pointer"
            >
              <Plus className="w-4 h-4 mr-1 sm:mr-2" /> Thêm Level
            </Button>
          </div>
        </div>

        {/* ==================== Desktop Table (lg+) ==================== */}
        <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 text-left">
                <th className="py-3 px-4 font-medium text-gray-700">
                  Tên Cấp độ
                </th>
                <th
                  className="py-3 px-4 font-medium text-gray-700 cursor-pointer select-none"
                  onClick={toggleSort}
                >
                  <div className="flex items-center gap-1">
                    Điểm tối thiểu {sortedIcon(sortOrder)}
                  </div>
                </th>
                <th className="py-3 px-4 font-medium text-gray-700">
                  Giảm giá (%)
                </th>
                <th className="py-3 px-4 font-medium text-gray-700">
                  Giảm tối đa
                </th>
                <th className="py-3 px-4 font-medium text-gray-700">Mô tả</th>
                <th className="py-3 px-4 font-medium text-gray-700 text-center">
                  Active
                </th>
                <th className="py-3 px-4 text-center w-12"></th>
              </tr>
            </thead>

            <tbody>
              {loading &&
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-20 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-16 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-12 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-24 rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="h-4 w-32 rounded" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Skeleton className="h-5 w-10 mx-auto rounded-full" />
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Skeleton className="h-8 w-8 mx-auto rounded-lg" />
                    </td>
                  </tr>
                ))}

              {!loading &&
                sortedLevels.map((lv) => (
                  <tr
                    key={lv.id}
                    className="border-b hover:bg-muted/10 transition-colors"
                  >
                    <td className="py-4 px-4 font-medium">{lv.name}</td>
                    <td className="py-4 px-4">
                      {Number(lv.minPoints).toLocaleString("vi-VN")}
                    </td>
                    <td className="py-4 px-4 font-semibold text-primary">
                      {lv.discountPercent}%
                    </td>
                    <td className="py-4 px-4">
                      {Number(lv.maxDiscountAmount).toLocaleString("vi-VN")} đ
                    </td>
                    <td className="py-4 px-4 text-muted-foreground text-xs max-w-50 truncate">
                      {lv.description || "—"}
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center justify-center">
                        <FancySwitch
                          size="xs"
                          checked={lv.isActive}
                          onChange={async () => {
                            await toggleLevelActive(lv.id);
                            load();
                          }}
                        />
                      </div>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="hover:bg-muted/20 cursor-pointer"
                        onClick={() => {
                          setEditLevel(lv);
                          setModalOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}

              {!loading && levels.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Không có cấp độ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ==================== Mobile Cards Layout (<lg) ==================== */}
        <div className="lg:hidden space-y-3">
          {loading &&
            [...Array(3)].map((_, i) => (
              <div
                key={i}
                className="border rounded-xl p-4 bg-white shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-3 w-40 rounded" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-dashed pt-3">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-4 w-20 rounded" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16 rounded" />
                    <Skeleton className="h-4 w-24 rounded" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-3 mt-1">
                  <Skeleton className="h-4 w-20 rounded" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            ))}

          {!loading &&
            sortedLevels.map((lv) => (
              <div
                key={lv.id}
                className="border rounded-xl p-4 bg-white shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base">
                      {lv.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {lv.description || "Không có mô tả"}
                    </p>
                  </div>
                  <span className="text-xs sm:text-sm font-semibold px-2.5 py-1 bg-primary/10 text-primary rounded-lg">
                    Giảm {lv.discountPercent}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs border-t border-dashed pt-3">
                  <div>
                    <span className="text-muted-foreground block">
                      Điểm tối thiểu:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {Number(lv.minPoints).toLocaleString("vi-VN")}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block">
                      Giảm giá tối đa:
                    </span>
                    <span className="font-semibold text-slate-700">
                      {Number(lv.maxDiscountAmount).toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-3 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Kích hoạt:
                    </span>
                    <FancySwitch
                      size="xs"
                      checked={lv.isActive}
                      onChange={async () => {
                        await toggleLevelActive(lv.id);
                        load();
                      }}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 text-xs gap-1.5 rounded-lg border-slate-200 cursor-pointer"
                    onClick={() => {
                      setEditLevel(lv);
                      setModalOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Sửa
                  </Button>
                </div>
              </div>
            ))}

          {!loading && levels.length === 0 && (
            <div className="border rounded-xl p-8 text-center text-muted-foreground bg-white">
              Không có cấp độ nào.
            </div>
          )}
        </div>
      </div>

      <LevelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        editData={editLevel}
      />
    </>
  );
}
