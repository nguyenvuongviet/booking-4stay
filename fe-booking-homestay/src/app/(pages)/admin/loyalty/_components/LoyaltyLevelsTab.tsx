"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
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

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const load = async () => {
    try {
      const data = await getLoyaltyLevels();
      setLevels(data);
    } catch {
      toast.error("Không thể tải danh sách cấp độ");
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
      <Card className="p-6 rounded-2xl shadow-sm border bg-white/70 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <p className="text-base text-muted-foreground mt-1">
            Quản lý các cấp độ và điều kiện tích điểm của khách hàng.
          </p>
          <div className="flex items-center gap-3">
            <RecomputeButton onDone={load} />
            <Button
              onClick={() => {
                setEditLevel(null);
                setModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Thêm Level
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
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
              {sortedLevels.map((lv) => (
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
                      className="hover:bg-muted/20"
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

              {levels.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-muted-foreground"
                  >
                    Không có cấp độ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <LevelModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        editData={editLevel}
      />
    </>
  );
}
