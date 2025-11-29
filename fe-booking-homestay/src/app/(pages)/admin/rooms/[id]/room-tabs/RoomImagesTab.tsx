"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  deleteRoomImages,
  setMainImage,
  updateOrder,
  uploadRoomImage,
} from "@/services/admin/roomsApi";
import type { Room, RoomImage } from "@/types/room";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import {
  ArrowRightLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface RoomImagesTabProps {
  room: Room;
  reload: () => void;
}

export default function RoomImagesTab({ room, reload }: RoomImagesTabProps) {
  const [images, setImages] = useState<RoomImage[]>(room.images.gallery || []);
  const [selected, setSelected] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  function openPreview(id: number) {
    const index = images.findIndex((i) => i.id === id);
    setPreviewIndex(index);
  }

  useEffect(() => {
    const sorted = [...room.images.gallery].sort(
      (a, b) => Number(b.isMain) - Number(a.isMain)
    );
    setImages(sorted);
  }, [room]);

  async function handleUpload(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    await uploadRoomImage(room.id, formData);
    setUploading(false);
    reload();
  }

  const onDrop = (files: File[]) => handleUpload(files);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
    accept: { "image/*": [] },
  });
  const sensors = useSensors(useSensor(PointerSensor));

  async function onDragEnd(evt: DragEndEvent) {
    const { active, over } = evt;
    if (!over || active.id === over.id) return;
    const oldIndex = images.findIndex((i) => i.id === active.id);
    const newIndex = images.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);
    setImages(reordered);
    await updateOrder(
      room.id,
      reordered.map((i) => i.id)
    );
  }

  async function deleteSelected() {
    if (!selected.length) return;
    await deleteRoomImages(room.id, selected);
    setSelected([]);
    reload();
  }

  function toggleSelect(id: number) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function setMain(id: number) {
    await setMainImage(room.id, id);
    reload();
  }

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto mb-2 w-6 h-6" />
        <p className="text-sm">Kéo thả ảnh hoặc click để upload</p>
        {uploading && (
          <p className="text-primary mt-2 text-sm">Đang tải ảnh...</p>
        )}
      </div>

      {selected.length > 0 && (
        <Button
          onClick={deleteSelected}
          className="flex items-center gap-2 bg-red-500"
        >
          <Trash2 className="w-4 h-4" />
          Xoá ( {selected.length} ) ảnh
        </Button>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={images.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <SortableImageItem
                key={img.id}
                img={img}
                selected={selected}
                toggleSelect={toggleSelect}
                onDelete={() =>
                  deleteRoomImages(room.id, [img.id]).then(reload)
                }
                onSetMain={() => setMain(img.id)}
                onPreview={() => openPreview(img.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {previewIndex !== null && (
        <ImageLightbox
          images={images}
          index={previewIndex}
          setIndex={(i) => setPreviewIndex(i)}
          onClose={() => setPreviewIndex(null)}
        />
      )}
    </div>
  );
}

interface SortableImageItemProps {
  img: RoomImage;
  selected: number[];
  toggleSelect: (id: number) => void;
  onDelete: () => void;
  onSetMain: () => void;
  onPreview: () => void;
}

function SortableImageItem({
  img,
  selected,
  toggleSelect,
  onSetMain,
  onPreview,
}: SortableImageItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: img.id });

  return (
    <Card
      ref={setNodeRef}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        transition,
      }}
      className="relative rounded-xl overflow-hidden aspect-4/3 bg-gray-100 group cursor-pointer"
      onClick={onPreview}
    >
      <div
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        className="absolute z-20 bottom-2 right-2 w-7 h-7 rounded-full bg-white/90 backdrop-blur flex items-center justify-center cursor-grab active:cursor-grabbing shadow text-gray-700"
      >
        <ArrowRightLeft className="w-4 h-4" />
      </div>
      <Image
        src={img.url}
        alt="room image"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="object-cover"
      />

      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleSelect(img.id);
        }}
        className="absolute top-2 right-2 z-20 w-6 h-6 rounded bg-white shadow flex items-center justify-center hover:bg-gray-100 cursor-pointer"
      >
        {selected.includes(img.id) && (
          <Check className="w-4 h-4 text-primary" />
        )}
      </button>

      {img.isMain && (
        <div className="absolute top-2 left-2 z-20 bg-black/60 text-white text-xs px-2 py-1 rounded">
          <div className="flex items-center justify-center">
            <Star className="w-4 h-4 fill-yellow-400 mr-1" />
            <span>Ảnh chính</span>
          </div>
        </div>
      )}

      {!img.isMain && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSetMain();
          }}
          className="absolute bottom-2 left-2 z-20 bg-black/60 text-white px-2 py-1 rounded text-xs shadow opacity-0 group-hover:opacity-100 transition cursor-pointer"
        >
          Đặt làm chính
        </button>
      )}
    </Card>
  );
}

function ImageLightbox({
  images,
  index,
  onClose,
  setIndex,
}: {
  images: RoomImage[];
  index: number;
  onClose: () => void;
  setIndex: (i: number) => void;
}) {
  const img = images[index];
  if (!img) return null;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setIndex(Math.min(images.length - 1, index + 1));
      if (e.key === "ArrowLeft") setIndex(Math.max(0, index - 1));
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [index]);

  return (
    <div
      className="fixed inset-0 bg-black/80 z-9999 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-6xl w-full max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={img.url}
          alt="preview"
          width={1600}
          height={1200}
          className="max-h-[85vh] w-auto object-contain rounded-lg shadow-xl"
        />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white text-black p-2 rounded-full shadow-lg transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {index > 0 && (
          <button
            onClick={() => setIndex(index - 1)}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg transition cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {index < images.length - 1 && (
          <button
            onClick={() => setIndex(index + 1)}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-black p-3 rounded-full shadow-lg transition cursor-pointer"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
