import { RoomDetailClient } from "@/components/RoomDetail"

export default function RoomDetailPage({ params }: { params: { id: string } }) {
  return <RoomDetailClient roomId={params.id} />
}

