"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Star } from "lucide-react";

export default function RoomImagesTab({
  room,
  reload,
}: {
  room: any;
  reload: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: any) {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    try {
      setUploading(true);

      await new Promise((res) => setTimeout(res, 1200));
      reload();
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button disabled={uploading} asChild>
          <label className="cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? "Đang tải..." : "Tải ảnh lên"}
            <input type="file" className="hidden" onChange={handleUpload} />
          </label>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {room.images?.gallery?.map((img: any) => (
          <Card key={img.id} className="overflow-hidden relative group">
            <img src={img.url} className="w-full h-48 object-cover" />

            {img.isMain && (
              <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs">
                <Star className="w-3 h-3 fill-yellow-400" />
                Ảnh chính
              </div>
            )}

            <button className="absolute top-2 right-2 bg-white p-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition">
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
