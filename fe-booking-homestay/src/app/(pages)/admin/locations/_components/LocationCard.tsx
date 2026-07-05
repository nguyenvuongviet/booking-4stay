"use client";

import { BaseLocation } from "@/services/admin/locationsApi";
import { motion } from "framer-motion";
import { Eye, MapPin, Trash2, Upload } from "lucide-react";
import { useRef } from "react";

interface Props {
  item: BaseLocation;
  type: "Country" | "Province" | "Ward";
  onEdit: (item: BaseLocation) => void;
  onDelete: (type: Props["type"], id: number) => void;
  onUploadImage?: (id: number, file: File) => Promise<void>;
}

export function LocationCard({
  item,
  type,
  onEdit,
  onDelete,
  onUploadImage,
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handlePick = () => fileRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    if (!onUploadImage) return;

    await onUploadImage(item.id, e.target.files[0]);
  };

  const isProvince = type === "Province";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4.5 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
    >
      <div className="flex flex-col gap-3">
        {/* Hàng trên: Ảnh và thông tin chữ */}
        <div className="flex gap-3 sm:gap-4 min-w-0 flex-1">
          <div
            className="relative w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden cursor-pointer shadow-md border border-slate-100 dark:border-slate-800"
            onClick={isProvince ? handlePick : undefined}
          >
            {isProvince && item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-500 drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              </div>
            )}

            {isProvince && (
              <div className="absolute inset-0 bg-linear-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 flex items-end justify-center p-2 text-white transition-opacity duration-300">
                <Upload className="w-4 h-4 animate-bounce mb-1" />
              </div>
            )}

            {isProvince && (
              <input
                type="file"
                accept="image/*"
                ref={fileRef}
                onChange={handleFileChange}
                className="hidden"
              />
            )}
          </div>

          <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors truncate tracking-tight">
              {item.name}
            </h3>

            <div className="flex flex-col">
              <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground uppercase tracking-wider opacity-80">
                {type === "Country"
                  ? "Quốc gia"
                  : type === "Province"
                    ? "Tỉnh thành"
                    : "Phường xã"}
              </span>

              {(item.country || item.province) && (
                <span className="text-[11px] sm:text-xs font-semibold text-cyan-500/90 truncate">
                  tại {item.country || item.province}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hàng dưới: GPS Active bên trái & Các nút thao tác bên phải */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-2 mt-1">
          <div>
            {item.latitude != null && item.longitude != null ? (
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full w-fit">
                <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]" />
                <span className="text-[8px] sm:text-[9px] font-black text-green-500 tracking-wider uppercase">
                  GPS ACTIVE
                </span>
              </div>
            ) : (
              <div className="w-1" />
            )}
          </div>

          <div className="flex gap-1.5">
            <button
              onClick={() => onEdit(item)}
              className="p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-800 hover:bg-primary/10 hover:text-primary rounded-lg border border-slate-200 dark:border-slate-700 transition-all active:scale-90 shadow-xs cursor-pointer text-slate-650 dark:text-slate-400"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={() => onDelete(type, item.id)}
              className="p-1.5 sm:p-2 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-550 rounded-lg border border-slate-200 dark:border-slate-700 transition-all active:scale-90 shadow-xs cursor-pointer text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
