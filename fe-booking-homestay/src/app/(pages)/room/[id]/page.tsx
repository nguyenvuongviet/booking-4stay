import { RoomDetailClient } from "@/app/(pages)/room/_component/RoomDetail";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  return <RoomDetailClient roomId={id} key={id} />;
}
