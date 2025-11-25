"use client";

import { Card } from "@/components/ui/card";
import { Eye, ImageIcon, MapPin, Trash2, Upload } from "lucide-react";
import { BaseLocation } from "@/services/admin/locationsApi";
import { useRef } from "react";

interface Props {
  item: BaseLocation;
  type: "Country" | "Province" | "District" | "Ward";
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
    <Card className="p-5 hover:shadow transition">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <div
            className="relative w-16 h-16 rounded-lg overflow-hidden cursor-pointer group"
            onClick={isProvince ? handlePick : undefined}
          >
            {isProvince && item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted/25 flex items-center justify-center">
                <MapPin className="w-7 h-7 text-cyan-500 opacity-70" />
              </div>
            )}

            {isProvince && (
              <div
                className="
                absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 
                flex items-center justify-center text-white transition
              "
              >
                <Upload className="w-6 h-6" />
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

          <div>
            <h3 className="font-semibold text-foreground">{item.name}</h3>

            {(item.country || item.province || item.district) && (
              <p className="text-sm text-muted-foreground">
                {item.country || item.province || item.district}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onEdit(item)}
            className="p-2 hover:bg-muted rounded-md cursor-pointer"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(type, item.id)}
            className="p-2 hover:bg-muted rounded-md cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </Card>
  );
}
