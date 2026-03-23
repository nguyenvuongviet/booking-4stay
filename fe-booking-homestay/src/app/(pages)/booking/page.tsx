import { Suspense } from "react";
import HistoryBookingClient from "./HistoryBookingClient";


export default function HistoryBooking() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoryBookingClient />
    </Suspense>
  );
}
