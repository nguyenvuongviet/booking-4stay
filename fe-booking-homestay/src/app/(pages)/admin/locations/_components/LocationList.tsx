"use client";

import { BaseLocation } from "@/services/admin/locationsApi";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { LocationCard } from "./LocationCard";

interface Props {
  loading: boolean;
  filteredList: BaseLocation[];
  currentType: "Country" | "Province" | "District" | "Ward";
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
          <div
            key={i}
            className="h-24 bg-white/5 rounded-2xl animate-pulse backdrop-blur-md border border-white/10"
          />
        ))}
      </div>
    );
  }

  if (filteredList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-white/5 rounded-3xl border border-dashed border-white/20 backdrop-blur-sm">
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
