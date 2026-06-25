import { Suspense } from "react";
import RoomsListClient from "./RoomsListClient";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomsListClient />
    </Suspense>
  );
}