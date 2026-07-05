"use client";

import { Card } from "@/_components/ui/card";
import { useMemo, useState } from "react";
import { Pagination } from "../../_components/Pagination";
import { RoomCard } from "./RoomCard";

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
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 animate-pulse">
        {Array.from({ length: pageSize }).map((_, idx) => (
          <Card
            key={idx}
            className="rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs overflow-hidden flex flex-col p-0 bg-card"
          >
            <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 bg-slate-200 dark:bg-slate-800" />
            <div className="p-4 sm:p-5 flex-1 space-y-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/40 flex justify-between items-center">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-lg w-20" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );

  if (error)
    return (
      <Card className="p-5 bg-red-50 text-red-700 border-red-200 rounded-2xl">
        <p className="text-xs sm:text-sm font-semibold">{error}</p>
      </Card>
    );

  return (
    <Card className="p-4 sm:p-5 space-y-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xs">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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
