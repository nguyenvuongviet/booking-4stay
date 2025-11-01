// ~/components/PhotoGalleryModal.tsx
"use client";

import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface Photo {
  id: number | string;
  url: string;
  isMain?: boolean;
}

interface PhotoGalleryModalProps {
  images: Photo[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  images,
  initialIndex = 0,
  isOpen,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const nextPhoto = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevPhoto = () =>
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-80">
      <div className="relative w-11/12 max-w-5xl h-[80vh] bg-background rounded-sm p-4 flex flex-col">
        {/* Close */}
        <button
          className="absolute top-4 right-4 text-gray-700 text-2xl z-50"
          onClick={onClose}
        >
          <X size={24} />
        </button>

        {/* Main Photo */}
        <div className="flex-1 flex items-center justify-center relative rounded-lg overflow-hidden">
          {/* Previous */}
          <button
            onClick={prevPhoto}
            className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 z-10"
          >
            <ChevronLeft size={32} />
          </button>

          {/* Image */}
          <img
            src={images[currentIndex].url}
            alt={`Room ${currentIndex}`}
            className="max-h-full max-w-full object-contain rounded-sm"
          />

          {/* Next */}
          <button
            onClick={nextPhoto}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 z-10"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Thumbnail Preview */}
        <div className="flex gap-2 mt-4 overflow-x-auto justify-center">
          {images.map((img, idx) => (
            <img
              key={img.id}
              src={img.url}
              alt={`Thumb ${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                idx === currentIndex ? "border-primary" : "border-transparent"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
