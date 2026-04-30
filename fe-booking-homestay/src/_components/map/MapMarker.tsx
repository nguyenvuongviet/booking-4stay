"use client";

import dynamic from "next/dynamic";

export const MapMarker = dynamic(
  () => import("./MapMarkerInner").then((mod) => mod.MapMarker),
  {
    ssr: false,
  },
);
