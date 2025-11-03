import { Card } from "@/components/ui/card";
import type { Room } from "@/types/room";
import { ImageIcon } from "lucide-react";
import React from "react";

interface RoomImagesTabProps {
  room: Room;
}

const RoomImagesTab: React.FC<RoomImagesTabProps> = ({ room }) => {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {room.images?.gallery?.length ? (
          room.images.gallery.map((img) => (
            <div
              key={img.id}
              className="relative aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer"
            >
              <img
                src={img.url}
                alt={room.name}
                className="w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="col-span-4 text-center text-muted-foreground py-10">
            <div className="inline-flex flex-col items-center p-8 bg-muted/50 rounded-lg">
              <ImageIcon className="w-10 h-10 mb-2 opacity-70 text-warm-500" />
              <p className="text-lg font-medium">
                Chưa có ảnh nào cho phòng này
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default RoomImagesTab;
