"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { RoomCard } from "./RoomCard";
import { Pagination } from "../../_components/Pagination";

export function RoomList({ rooms, loading, error, onDelete }: any) {
  const [page, setPage] = useState(1);
  const pageSize = 6;
  const pageCount = Math.max(1, Math.ceil((rooms?.length ?? 0) / pageSize));

  const pagedRooms = useMemo(() => {
    if (!rooms || rooms.length === 0) return [];
    return rooms.slice((page - 1) * pageSize, page * pageSize);
  }, [rooms, page]);

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
    <Card className="p-4 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pagedRooms.length > 0 ? (
          pagedRooms.map((room: any) => (
            <RoomCard key={room.id} room={room} onDelete={onDelete} />
          ))
        ) : (
          <p className="col-span-full text-center text-muted-foreground">
            Không có phòng nào phù hợp.
          </p>
        )}
      </div>
      <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </Card>
  );
}
