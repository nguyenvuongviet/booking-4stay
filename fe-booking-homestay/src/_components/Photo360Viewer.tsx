"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { Viewer } from "@photo-sphere-viewer/core";
import "@photo-sphere-viewer/core/index.css";

interface Photo360ViewerProps {
  imageUrl: string;
  isOpen: boolean;
  onClose: () => void;
}

export const Photo360Viewer: React.FC<Photo360ViewerProps> = ({
  imageUrl,
  isOpen,
  onClose,
}) => {
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (!isOpen || !viewerRef.current || !imageUrl) return;

    //destroy instance cũ nếu có
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }

    //init viewer
    instanceRef.current = new Viewer({
      container: viewerRef.current,
      panorama: imageUrl,
      navbar: ["zoom", "fullscreen"],
      defaultZoomLvl: 50,
    });

    return () => {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, [isOpen, imageUrl]);

  useEffect(() => {
    if (!isOpen) {
      instanceRef.current?.destroy();
      instanceRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      <div className="relative w-full h-full">
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-white z-50"
          onClick={onClose}
        >
          <X size={28} />
        </button>

        {/* Viewer */}
        <div ref={viewerRef} className="w-full h-full" />
      </div>
    </div>
  );
};
