"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getLoyaltyLevels,
  LoyaltyLevel,
  toggleLevelActive,
} from "@/services/admin/loyaltyApi";
import { Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
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

  const load = async () => {
    try {
      const data = await getLoyaltyLevels();
      setLevels(data.sort((a, b) => a.minPoints - b.minPoints));
    } catch {
      toast.error("Không thể tải danh sách cấp độ");
    }
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

        <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30 border-b text-muted-foreground">
                <th className="py-3 px-4 text-left font-semibold">
                  Tên Cấp độ
                </th>
                <th className="py-3 px-4 text-left font-semibold">
                  Điểm tối thiểu
                </th>
                <th className="py-3 px-4 text-left font-semibold">Mô tả</th>
                <th className="py-3 px-4 text-center font-semibold">Active</th>
                <th className="py-3 px-4 text-center w-12"></th>
              </tr>
            </thead>

            <tbody>
              {levels.map((lv) => (
                <tr
                  key={lv.id}
                  className="border-b hover:bg-muted/10 transition-colors"
                >
                  <td className="py-4 px-4 font-medium">{lv.name}</td>
                  <td className="py-4 px-4">{lv.minPoints}</td>
                  <td className="py-4 px-4 text-muted-foreground">
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
