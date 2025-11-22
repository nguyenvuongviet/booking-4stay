"use client";

import Loader from "@/components/loader/Loader";
import { LocationCard } from "./LocationCard";
import { BaseLocation } from "@/services/admin/locationsApi";

interface Props {
  loading: boolean;
  filteredList: BaseLocation[];
  currentType: "Country" | "Province" | "District" | "Ward";
  onEdit: (item: BaseLocation) => void;
  onDelete: (type: Props["currentType"], id: number) => void;
  onUploadImage?: (id: number, file: File) => Promise<void>;
}

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
      <div className="py-10 flex justify-center">
        <Loader />
      </div>
    );
  }

  if (!filteredList.length) {
    return (
      <p className="text-center text-muted-foreground py-10">
        Không có dữ liệu.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredList.map((item) => (
        <LocationCard
          key={item.id}
          item={item}
          type={currentType}
          onEdit={onEdit}
          onDelete={onDelete}
          onUploadImage={onUploadImage}
        />
      ))}
    </div>
  );
}
