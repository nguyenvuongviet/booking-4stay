"use client";

import { useState } from "react";
import { RoomFilterBar } from "./_components/RoomFilterBar";
import { RoomFormModal } from "./_components/RoomFormModal";
import { RoomHeader } from "./_components/RoomHeader";
import { RoomList } from "./_components/RoomList";
import { useRooms } from "./_hooks/useRooms";

export default function RoomsPage() {
  const rooms = useRooms();
  const [openModal, setOpenModal] = useState(false);

  const handleCreateSuccess = () => {
    rooms.fetchRooms();
    setOpenModal(false);
  };

  return (
    <div className="space-y-6">
      <RoomHeader
        onRefresh={rooms.fetchRooms}
        onAdd={() => setOpenModal(true)}
      />

      <RoomFilterBar {...rooms} />

      <RoomList
        rooms={rooms.rooms}
        loading={rooms.loading}
        error={rooms.error}
        onDelete={rooms.handleDelete}
      />

      <RoomFormModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
