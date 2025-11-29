"use client";

import { useToast } from "@/components/ui/use-toast";
import { createRoom, updateRoom } from "@/services/admin/roomsApi";
import { useEffect, useState } from "react";
import type { Room } from "@/types/room";

export interface RoomFormValues {
  name: string;
  description: string;
  price: number | "";
  adultCapacity: number | "";
  childCapacity: number | "";
  street: string;
  countryId: number | null;
  provinceId: number | null;
  districtId: number | null;
  wardId: number | null;
}

const defaultForm: RoomFormValues = {
  name: "",
  description: "",
  price: "",
  adultCapacity: "",
  childCapacity: "",
  street: "",
  countryId: null,
  provinceId: null,
  districtId: null,
  wardId: null,
};

interface UseRoomFormProps {
  onSuccess?: () => void;
  initialData?: Room | null;
  isEditMode?: boolean;
}

export function useRoomForm({
  onSuccess,
  initialData = null,
  isEditMode = false,
}: UseRoomFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<RoomFormValues>(defaultForm);

  const resetForm = () => {
    if (isEditMode && initialData) {
      setForm({
        name: initialData.name,
        description: initialData.description ?? "",
        price: initialData.price,
        adultCapacity: initialData.adultCapacity,
        childCapacity: initialData.childCapacity ?? 0,
        street: initialData.location.street,
        countryId: initialData.location.countryId,
        provinceId: initialData.location.provinceId,
        districtId: initialData.location.districtId,
        wardId: initialData.location.wardId,
      });
    } else {
      setForm(defaultForm);
    }
  };

  useEffect(() => {
    if (isEditMode && initialData) {
      resetForm();
    }
  }, [initialData, isEditMode]);

  const update = (key: keyof RoomFormValues, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateMany = (values: Partial<RoomFormValues>) => {
    setForm((prev) => ({ ...prev, ...values }));
  };

  const validate = () => {
    if (!form.name.trim()) return "Tên phòng không được để trống";
    if (!form.price || form.price <= 0) return "Giá phòng không hợp lệ";
    if (!form.adultCapacity || form.adultCapacity <= 0)
      return "Sức chứa người lớn không hợp lệ";
    if (!form.countryId || !form.provinceId || !form.districtId || !form.wardId)
      return "Vui lòng chọn đầy đủ vị trí";
    if (!form.street.trim()) return "Vui lòng nhập tên đường / số nhà";
    return null;
  };

  const submit = async () => {
    const msg = validate();
    if (msg) {
      toast({ variant: "destructive", title: msg });
      return;
    }
    try {
      setLoading(true);
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        adultCapacity: Number(form.adultCapacity),
        childCapacity: Number(form.childCapacity),
        provinceId: Number(form.provinceId),
        districtId: Number(form.districtId),
        wardId: Number(form.wardId),
        street: form.street,
      };
      if (isEditMode && initialData) {
        await updateRoom(initialData.id, payload);
        toast({ variant: "success", title: "Cập nhật phòng thành công!" });
      } else {
        await createRoom(payload);
        toast({ variant: "success", title: "Tạo phòng thành công!" });
      }
      onSuccess?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Không thể lưu phòng",
        description: error?.response?.data?.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form,
    update,
    updateMany,
    submit,
    loading,
    resetForm,
  };
}
