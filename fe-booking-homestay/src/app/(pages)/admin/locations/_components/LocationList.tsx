"use client";

import { Skeleton } from "@/_components/ui/skeleton";
import { BaseLocation } from "@/services/admin/locationsApi";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { LocationCard } from "./LocationCard";

interface Props {
  loading: boolean;
  filteredList: BaseLocation[];
  currentType: "Country" | "Province" | "Ward";
  onEdit: (item: BaseLocation) => void;
  onDelete: (type: Props["currentType"], id: number) => void;
  onUploadImage?: (id: number, file: File) => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function LocationList({
  loading,
  filteredList,
  currentType,
  onEdit,
  onDelete,
  onUploadImage,
}: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4.5 space-y-3"
          >
            <div className="flex gap-3 sm:gap-4">
              <Skeleton className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/55 pt-2 mt-1">
              <Skeleton className="h-4 w-16 rounded-full" />
              <div className="flex gap-1.5">
                <Skeleton className="w-8 h-8 rounded-lg" />
                <Skeleton className="w-8 h-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
        <MapPin className="w-16 h-16 opacity-20 mb-4 animate-bounce text-cyan-500" />
        <p className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-500 to-blue-500">
          Không tìm thấy dữ liệu nào.
        </p>
        <p className="text-sm font-medium">
          Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      {filteredList.map((item) => (
        <motion.div key={item.id} variants={itemVariants}>
          <LocationCard
            item={item}
            type={currentType}
            onEdit={onEdit}
            onDelete={onDelete}
            onUploadImage={onUploadImage}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
