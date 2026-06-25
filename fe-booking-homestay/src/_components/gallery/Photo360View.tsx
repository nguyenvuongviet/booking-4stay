"use client";

import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";
import { useEffect, useRef, useState } from "react";

export const Photo360View = ({ imageUrl }: { imageUrl: string }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !imageUrl) return;

    let isMounted = true;

    // preload trước
    const img = new Image();
    img.src = imageUrl;

    img.onload = () => {
      if (!isMounted) return;

      setLoaded(true);

      // destroy viewer cũ
      viewerRef.current?.destroy();

      // delay 1 tick để đảm bảo DOM ready
      setTimeout(() => {
        if (!containerRef.current) return;

        viewerRef.current = new Viewer({
          container: containerRef.current,
          panorama: imageUrl,
          navbar: ["zoom", "fullscreen"],
          defaultZoomLvl: 50,
        });
      }, 50);
    };

    return () => {
      isMounted = false;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [imageUrl]);

  return (
    <div className="w-full h-full relative">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center text-white">
          Loading 360...
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
