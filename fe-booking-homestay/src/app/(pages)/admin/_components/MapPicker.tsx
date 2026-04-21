"use client";

import dynamic from "next/dynamic";

export const MapPicker = dynamic(
  () => import("./MapPickerInner").then((mod) => mod.MapPicker),
  {
    ssr: false,
  }
);