"use client";

import { useEffect, useRef, useState } from "react";

interface Photo {
  id: number | string;
  url: string;
  isMain?: boolean;
}

interface GalleryItem extends Photo {
  type: "image" | "360";
}

export const useGallery = (images: Photo[]) => {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const cache = useRef<Record<string, boolean>>({});

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

  // build gallery
  useEffect(() => {
    const run = async () => {
      const result: GalleryItem[] = [];

      for (const img of images) {
        let is360 = cache.current[img.url];

        if (is360 === undefined) {
          is360 = await detect360(img.url);
          cache.current[img.url] = is360;
        }

        result.push({
          ...img,
          type: is360 ? "360" : "image",
        });
      }

      setGallery(result);
    };

    run();
  }, [images]);

  // navigation (loop)
  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % gallery.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  // preload (smart)
  useEffect(() => {
    const preload = (item?: GalleryItem) => {
      if (!item) return;
      const img = new Image();
      img.src = item.url;
    };

    preload(gallery[currentIndex]);
    preload(gallery[currentIndex + 1]);
  }, [currentIndex, gallery]);

  return {
    gallery,
    currentIndex,
    setCurrentIndex,
    current: gallery[currentIndex],
    next,
    prev,
  };
};
