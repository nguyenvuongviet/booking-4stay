"use client";

import { useToast } from "@/components/ui/use-toast";
import {
  getAllAmenities,
  setRoomAmenities,
  setRoomBeds,
} from "@/services/admin/roomsApi";
import type { Amenity, BedItemDto } from "@/types/room";
import { useCallback, useState } from "react";

export function useRoomExtrasForm(roomId: number) {
  const { toast } = useToast();

  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [amenityIds, setAmenityIds] = useState<number[]>([]);
  const [loadingAmenities, setLoadingAmenities] = useState(false);

  const [beds, setBeds] = useState<BedItemDto[]>([]);
  const [loadingBeds, setLoadingBeds] = useState(false);

  const fetchAmenities = useCallback(async () => {
    try {
      setLoadingAmenities(true);
      const res = await getAllAmenities();
      setAllAmenities(res);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Không thể tải danh sách tiện nghi",
      });
    } finally {
      setLoadingAmenities(false);
    }
  }, [toast]);

  const submitAmenities = async () => {
    try {
      setLoadingAmenities(true);
      await setRoomAmenities(roomId, { amenityIds });

      toast({
        variant: "success",
        title: "Cập nhật tiện nghi thành công!",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description: err?.response?.data?.message,
      });
    } finally {
      setLoadingAmenities(false);
    }
  };

  const submitBeds = async () => {
    try {
      setLoadingBeds(true);
      await setRoomBeds(roomId, { beds });
      toast({
        variant: "success",
        title: "Cập nhật giường thành công!",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Không thể lưu giường",
        description: err?.response?.data?.message,
      });
    } finally {
      setLoadingBeds(false);
    }
  };

  return {
    allAmenities,
    amenityIds,
    setAmenityIds,
    fetchAmenities,
    submitAmenities,
    loadingAmenities,

    beds,
    setBeds,
    submitBeds,
    loadingBeds,
  };
}
