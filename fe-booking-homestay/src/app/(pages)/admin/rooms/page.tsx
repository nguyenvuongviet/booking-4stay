"use client";

import { useEffect, useState } from "react";
import { RoomFilterBar } from "./_components/RoomFilterBar";
import { RoomFormModal } from "./_components/RoomFormModal";
import { RoomHeader } from "./_components/RoomHeader";
import { RoomList } from "./_components/RoomList";
import { useRooms } from "./_hooks/useRooms";

export default function RoomsPage() {
  const rooms = useRooms();
  const [openModal, setOpenModal] = useState(false);

  const [progress, setProgress] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  useEffect(() => {
    if (!autoRefreshEnabled) {
      setProgress(0);
      return;
    }

    const duration = 15000;
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          rooms.fetchRooms();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, rooms.fetchRooms]);

  const handleCreateSuccess = () => {
    rooms.fetchRooms();
    setOpenModal(false);
  };

  return (
    <div className="space-y-6">
      <RoomHeader
        onRefresh={async () => {
          await rooms.fetchRooms();
          setProgress(0);
        }}
        onAdd={() => setOpenModal(true)}
        progress={progress}
        autoRefreshEnabled={autoRefreshEnabled}
        setAutoRefreshEnabled={setAutoRefreshEnabled}
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
