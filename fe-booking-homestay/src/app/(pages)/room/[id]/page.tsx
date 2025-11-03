import { RoomDetailClient } from "@/components/rooms/RoomDetail";

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  return <RoomDetailClient roomId={params.id} key={params.id} />;
}
