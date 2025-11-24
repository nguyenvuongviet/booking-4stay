"use client";

import { toast } from "@/components/ui/use-toast";
import {
  BaseLocation,
  LocationType,
  createLocation as apiCreate,
  deleteLocation as apiDelete,
  uploadProvinceImage as apiUploadProvinceImage,
  getLocationsByType,
  updateLocation,
} from "@/services/admin/locationsApi";
import { useCallback, useEffect, useState } from "react";

export function useLocations() {
  const [dataType, setDataType] = useState<
    "Country" | "Province" | "District" | "Ward"
  >("Country");
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [countries, setCountries] = useState<BaseLocation[]>([]);
  const [provinces, setProvinces] = useState<BaseLocation[]>([]);
  const [districts, setDistricts] = useState<BaseLocation[]>([]);
  const [list, setList] = useState<BaseLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const typeLower = dataType.toLowerCase() as LocationType;
      let parentId: number | undefined;

      if (dataType === "Province" && selectedParent)
        parentId = countries.find((c) => c.name === selectedParent)?.id;
      if (dataType === "District" && selectedParent)
        parentId = provinces.find((p) => p.name === selectedParent)?.id;
      if (dataType === "Ward" && selectedParent)
        parentId = districts.find((d) => d.name === selectedParent)?.id;

      const res = await getLocationsByType(typeLower, parentId);

      setList(res);
      if (dataType === "Country") setCountries(res);
      if (dataType === "Province") setProvinces(res);
      if (dataType === "District") setDistricts(res);
    } catch {
      toast({ variant: "destructive", title: "Không thể tải dữ liệu" });
    } finally {
      setLoading(false);
    }
  }, [dataType, selectedParent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredList = list.filter((i) =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const create = async (
    type: "Country" | "Province" | "District" | "Ward",
    raw: any
  ) => {
    try {
      let payload: any = {
        name: raw.name,
      };

      if (type === "Country") {
        payload.code = raw.code?.toUpperCase();
      } else {
        const map = {
          Province: "countryId",
          District: "provinceId",
          Ward: "districtId",
        } as const;

        const fieldName = map[type];
        payload[fieldName] = Number(raw.parentId);
      }

      await apiCreate(type.toLowerCase() as LocationType, payload);

      toast({ variant: "success", title: `${type} đã được tạo` });

      await fetchData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Tạo thất bại",
        description: err?.response?.data?.message,
      });
      throw err;
    }
  };

  const edit = async (
    type: "Country" | "Province" | "District" | "Ward",
    id: number,
    raw: any
  ) => {
    try {
      const payload: any = { name: raw.name?.trim() };

      if (type === "Country") {
        payload.code = raw.code?.toUpperCase();
      } else {
        const map = {
          Province: "countryId",
          District: "provinceId",
          Ward: "districtId",
        } as const;

        const parentField = map[type];
        payload[parentField] = Number(raw.parentId || raw.existingParentId);
      }

      await updateLocation(type.toLowerCase() as LocationType, id, payload);
      toast({ variant: "success", title: `${type} đã được cập nhật` });
      await fetchData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: `Cập nhật ${type} thất bại`,
        description: err?.response?.data?.message,
      });
    }
  };

  const remove = async (
    type: "Country" | "Province" | "District" | "Ward",
    id: number
  ) => {
    const ok = confirm(`Bạn có chắc muốn xoá ${type} này?`);
    if (!ok) return;

    try {
      await apiDelete(type.toLowerCase() as LocationType, id);

      toast({
        variant: "success",
        title: "Đã xoá thành công",
      });

      await fetchData();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Xoá thất bại",
        description: err?.response?.data?.message || "Vui lòng thử lại.",
      });
    }
  };

  const uploadProvinceImage = async (id: number, file: File) => {
    try {
      const url = await apiUploadProvinceImage(id, file);
      toast({
        variant: "success",
        title: "Tải ảnh thành công",
      });

      await fetchData();
      return url;
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Tải ảnh thất bại",
        description: err?.response?.data?.message,
      });
      throw err;
    }
  };

  return {
    dataType,
    setDataType,
    selectedParent,
    setSelectedParent,

    countries,
    provinces,
    districts,

    filteredList,
    loading,
    searchTerm,
    setSearchTerm,

    fetchData,
    create,
    edit,
    remove,
    uploadProvinceImage,
  };
}
