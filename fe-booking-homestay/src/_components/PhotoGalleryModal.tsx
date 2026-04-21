// ~/components/PhotoGalleryModal.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Photo360Viewer } from "./Photo360Viewer";
import { Viewer } from "@photo-sphere-viewer/core";
import { Button } from "./ui/button";

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
  const [activeTab, setActiveTab] = useState<"image" | "360">("image");
  const [images360, setImages360] = useState<Photo[]>([]);
  const [normalImages, setNormalImages] = useState<Photo[]>([]);
  const [is360Open, setIs360Open] = useState(false);

  const cache = useRef<Record<string, boolean>>({});

  const currentList = activeTab === "360" ? images360 : normalImages;

  // detect 360
  const detect360 = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        resolve(ratio > 1.8 && ratio < 2.2);
      };
      img.onerror = () => resolve(false);
      img.src = url;
    });
  };

  // classify images
  useEffect(() => {
    const classify = async () => {
      const img360: Photo[] = [];
      const normal: Photo[] = [];

      for (const img of images) {
        if (cache.current[img.url] !== undefined) {
          cache.current[img.url] ? img360.push(img) : normal.push(img);
          continue;
        }

        const is360 = await detect360(img.url);
        cache.current[img.url] = is360;

        if (is360) img360.push(img);
        else normal.push(img);
      }

      setImages360(img360);
      setNormalImages(normal);

      // auto chọn tab
      if (img360.length > 0) setActiveTab("image");
    };

    classify();
  }, [images]);

  // reset index khi đổi tab
  useEffect(() => {
    setCurrentIndex(0);
  }, [activeTab]);

  // preload ảnh next
  useEffect(() => {
    if (activeTab !== "image") return;

    const nextIndex = (currentIndex + 1) % normalImages.length;
    const img = new Image();
    img.src = normalImages[nextIndex]?.url;
  }, [currentIndex, activeTab]);

  const nextPhoto = () => {
    if (currentIndex < currentList.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const prevPhoto = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-80">
      <div className="w-11/12 max-w-5xl h-[80vh] bg-background rounded-lg p-4 flex flex-col">

        <div className="flex justify-between items-center mb-2">
          <div className="flex gap-2">
            {/* Photos */}
            {normalImages.length > 0 && (
              <Button
                onClick={() => setActiveTab("image")}
                variant="ghost"
                size="sm"              >
                Photos ({normalImages.length})
              </Button>
            )}

            {/* 360 */}
            {images360.length > 0 && (
              <Button
                onClick={() => setActiveTab("360")}
                variant="ghost"
                size="sm"
              >
                360° photos ({images360.length})
              </Button>
            )}
          </div>

          <button className=" text-gray-700 text-2xl z-50"
            onClick={onClose}>
            <X size={28} />
          </button>
        </div>

        {/* Main Photo */}
        <div className="flex-1 flex items-center justify-center relative rounded-lg overflow-hidden">
          {activeTab === "image" && normalImages.length > 0 && (
            <>
              {/* Previous */}
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 z-10"
              >
                <ChevronLeft size={32} />
              </button>

              {/* Image */}
              <img
                src={normalImages[currentIndex].url}
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
            </>
          )}
          {/* 360 */}
          {activeTab === "360" && images360.length > 0 && (
            <>
              {/* Previous */}
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 z-10"
              >
                <ChevronLeft size={32} />
              </button>

              <div>
                {/* Image */}
                <img
                  src={images360[currentIndex]?.url}
                  alt={`Room ${currentIndex}`}
                  className="max-h-full max-w-full object-contain rounded-sm"
                />
                {images360.length > 0 && (
                  <div className="absolute bottom-4 right-4 group">
                    <button
                      onClick={() => setIs360Open(true)}
                      className="bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg transition"
                    >
                      <Eye size={20} />
                    </button>

                    <div className="absolute bottom-12 right-1/2 translate-x-1/2 text-white text-xs px-2 py-1 
                                  opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                      View 360°
                    </div>
                  </div>
                )}
              </div>

              {/* Next */}
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 rounded-full p-2 hover:bg-black/50 z-10"
              >
                <ChevronRight size={32} />
              </button>

              <Photo360Viewer
                imageUrl={images360[currentIndex]?.url}
                isOpen={is360Open}
                onClose={() => setIs360Open(false)}
              />
            </>
          )}
        </div>

        {/* Thumbnail Preview */}
        <div className="flex gap-2 mt-4 overflow-x-auto justify-center">
          {currentList.map((img, idx) => (
            <img
              key={img.id}
              src={img.url}
              alt={`Thumb ${idx}`}
              onClick={() => setCurrentIndex(idx)}
              className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${idx === currentIndex ? "border-primary" : "border-transparent"
                }`}
            />
          ))}
        </div>


      </div>
    </div>
  );
};
