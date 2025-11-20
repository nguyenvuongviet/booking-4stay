"use client";

import { useToast } from "@/components/ui/use-toast";
import { createRoom } from "@/services/admin/roomsApi";
import { useState } from "react";

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

export function useRoomForm(onSuccess?: () => void) {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<RoomFormValues>({
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
  });

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
    const err = validate();
    if (err) {
      toast({ variant: "destructive", title: err });
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

      await createRoom(payload);

      toast({
        variant: "success",
        title: "Tạo phòng thành công!",
      });

      if (onSuccess) onSuccess();

      setForm({
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
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Không thể tạo phòng",
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
  };
}
