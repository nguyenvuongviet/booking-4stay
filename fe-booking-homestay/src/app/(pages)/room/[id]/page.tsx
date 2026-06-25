import { RoomDetailClient } from "@/app/(pages)/room/[id]/RoomDetailClient";
import { Suspense } from "react";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomDetailClient roomId={id} key={id} />
    </Suspense>
  );
}
