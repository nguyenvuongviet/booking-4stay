"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { cn } from "@/lib/utils";
import { Room } from "@/types/room";
import {
  Baby,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  Users,
  X,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

interface RoomSelectionGridProps {
  rooms: Room[];
  selectedRoomId: number | null;
  onSelect: (roomId: number | null) => void;
}

const ITEMS_PER_PAGE = 6;

export function RoomSelectionGrid({
  rooms,
  selectedRoomId,
  onSelect,
}: RoomSelectionGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const selectedRoom = useMemo(() => {
    if (selectedRoomId === null) return null;
    return rooms.find((r) => r.id === selectedRoomId) || null;
  }, [rooms, selectedRoomId]);

  const filteredRooms = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return rooms;
    return rooms.filter((room) => {
      const nameMatch = room.name.toLowerCase().includes(term);
      const provinceMatch = room.location?.province
        ?.toLowerCase()
        .includes(term);
      const addressMatch = room.location?.fullAddress
        ?.toLowerCase()
        .includes(term);
      const streetMatch = room.location?.street?.toLowerCase().includes(term);
      return nameMatch || provinceMatch || addressMatch || streetMatch;
    });
  }, [rooms, searchTerm]);

  const totalPages = Math.ceil(filteredRooms.length / ITEMS_PER_PAGE);
  const currentRooms = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRooms.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredRooms, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (selectedRoom) {
    const mainImage = selectedRoom.images?.main || "/placeholder-room.png";
    return (
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <button
          onClick={() => onSelect(null)}
          className="w-full flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-primary/5 border border-primary/20 hover:border-primary/30 rounded-2xl sm:rounded-3xl p-4 shadow-xs text-left transition-all relative group cursor-pointer"
        >
          <div className="relative w-full sm:w-48 h-32 rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100 shrink-0">
            <Image
              src={mainImage}
              alt={selectedRoom.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center transition-colors">
              <CheckCircle2 className="w-8 h-8 text-white group-hover:hidden drop-shadow-lg" />
              <X className="w-8 h-8 text-rose-500 bg-white rounded-full p-1.5 hidden group-hover:block drop-shadow-lg scale-110 transition-all animate-in zoom-in-90" />
            </div>
          </div>
          <div className="flex-1 space-y-2 w-full">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <h4 className="font-black text-base text-gray-900 leading-tight transition-colors">
                {selectedRoom.name}
              </h4>
              <span className="text-sm font-black text-primary shrink-0">
                {Number(selectedRoom.price).toLocaleString()}₫ / đêm
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500 font-bold uppercase tracking-wider">
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-gray-400" />
                Sức chứa: {selectedRoom.adultCapacity} người lớn
              </div>
              {selectedRoom.childCapacity && selectedRoom.childCapacity > 0 && (
                <div className="flex items-center gap-1">
                  <Baby className="w-3.5 h-3.5 text-gray-400" />
                  {selectedRoom.childCapacity} trẻ em
                </div>
              )}
            </div>
            <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Bấm vào đây để hủy chọn phòng này
            </p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative w-full mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Tìm theo tên phòng, thành phố, địa chỉ..."
          className="pl-10 h-10 rounded-xl bg-gray-50 border-gray-200 focus:bg-white transition-all shadow-sm text-sm"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {currentRooms.map((room) => {
          const isSelected = selectedRoomId === room.id;
          const mainImage = room.images?.main || "/placeholder-room.png";

          return (
            <button
              key={room.id}
              onClick={() => onSelect(room.id)}
              className={cn(
                "flex flex-col rounded-2xl border-2 text-left transition-all group overflow-hidden h-full relative cursor-pointer",
                isSelected
                  ? "border-primary bg-primary/5 ring-4 ring-primary/10 shadow-xl scale-[1.02] z-10"
                  : "border-gray-100 bg-white hover:border-primary/40 hover:shadow-lg hover:scale-[1.01]",
              )}
            >
              {/* Room Image */}
              <div className="relative w-full h-32 bg-gray-100 overflow-hidden">
                <Image
                  src={mainImage}
                  alt={room.name}
                  fill
                  className={cn(
                    "object-cover transition-transform duration-700",
                    !isSelected && "group-hover:scale-110",
                  )}
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/40 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in zoom-in-95">
                    <CheckCircle2 className="w-8 h-8 text-white drop-shadow-lg" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-0.5 rounded-lg shadow-sm">
                  <span className="text-xs font-black text-primary">
                    {Number(room.price).toLocaleString()}₫
                  </span>
                </div>
              </div>

              <div className="p-3 flex flex-col flex-1">
                <h4
                  className={cn(
                    "font-black text-sm mb-2 line-clamp-1 transition-colors flex-1",
                    isSelected ? "text-primary" : "text-gray-900",
                  )}
                >
                  {room.name}
                </h4>

                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-auto">
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    {room.adultCapacity}
                  </div>
                  {room.childCapacity && room.childCapacity > 0 && (
                    <div className="flex items-center gap-1">
                      <Baby className="w-3 h-3 text-gray-400" />
                      {room.childCapacity}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="py-12 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-sm font-bold italic">
            Không tìm thấy phòng phù hợp...
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Trang {currentPage} / {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-gray-200 cursor-pointer"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="w-3 h-3" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-lg border-gray-200 cursor-pointer"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <ChevronRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
