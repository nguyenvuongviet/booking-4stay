import BookingDetailClient from "@/components/bookings/BookingDetailClient";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; 
  return <BookingDetailClient bookingId={id} />;
}
