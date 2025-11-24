"use client";

import { Card } from "@/components/ui/card";
import { RoomCard } from "./RoomCard";

export function RoomList({ rooms, loading, error, onDelete }: any) {
  if (loading)
    return (
      <Card className="p-6">
        <p>Đang tải danh sách phòng...</p>
      </Card>
    );

  if (error)
    return (
      <Card className="p-6 bg-red-50 text-red-700">
        <p>{error}</p>
      </Card>
    );

  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {rooms.length > 0 ? (
          rooms.map((room: any) => (
            <RoomCard key={room.id} room={room} onDelete={onDelete} />
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">
            Không có phòng nào phù hợp.
          </p>
        )}
      </div>
    </Card>
  );
}
