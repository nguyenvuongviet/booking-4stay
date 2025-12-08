import { RoomDetailClient } from "@/components/rooms/RoomDetail";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <RoomDetailClient roomId={id} key={id} />;
}
