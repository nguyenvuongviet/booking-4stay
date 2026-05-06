"use client";

import { useGallery } from "@/_hooks/useGallery";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect } from "react";
import { Photo360View } from "./Photo360View";

interface Photo {
  id: number | string;
  url: string;
  isMain?: boolean;
}

interface Props {
  images: Photo[];
  selectedUrl?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoGalleryModal = ({
  images,
  selectedUrl,
  isOpen,
  onClose,
}: Props) => {
  const { gallery, currentIndex, setCurrentIndex, current, next, prev } =
    useGallery(images);

  // select đúng ảnh khi mở
  useEffect(() => {
    if (!selectedUrl || gallery.length === 0) return;

    const idx = gallery.findIndex((i) => i.url === selectedUrl);
    if (idx >= 0) setCurrentIndex(idx);
  }, [selectedUrl, gallery]);

  // keyboard
  useEffect(() => {
    const handle = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [isOpen, gallery]);

  if (!isOpen || !current) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
      <div className="w-[95vw] max-w-[1600px] h-full rounded-lg p-4 flex flex-col">
        <div className="flex justify-end items-center mb-2">
          {/* Header */}
          <button onClick={onClose}>
            <X className="text-white" size={28} />
          </button>
        </div>

        {/* Viewer */}
        <div className="flex-1 flex items-center justify-center relative rounded-lg overflow-hidden">
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 text-white z-10"
          >
            <ChevronLeft size={40} />
          </button>

          <div className="w-full h-full flex items-center justify-center">
            {current.type === "image" ? (
              <img src={current.url} className="w-full h-full object-contain" />
            ) : (
              <Photo360View imageUrl={current.url} />
            )}

            {current.type === "360" && (
              <div className="absolute top-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
                360°
              </div>
            )}
          </div>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 text-white z-10"
          >
            <ChevronRight size={40} />
          </button>
        </div>

        {/* Thumbnails */}
        <div className="flex gap-2 p-2 overflow-x-auto justify-center">
          {gallery.map((img, idx) => (
            <img
              key={img.id}
              src={img.url}
              onClick={() => setCurrentIndex(idx)}
              className={`w-20 h-20 object-cover rounded cursor-pointer border-2 transition
              ${
                idx === currentIndex
                  ? "border-white scale-105"
                  : "opacity-60 hover:opacity-100"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
