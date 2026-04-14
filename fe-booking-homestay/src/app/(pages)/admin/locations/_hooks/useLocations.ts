"use client";

import { toast } from "@/_components/ui/use-toast";
import {
  BaseLocation,
  LocationType,
  createLocation as apiCreate,
  deleteLocation as apiDelete,
  uploadProvinceImage as apiUploadProvinceImage,
  getCountries,
  getDistricts,
  getLocationsByType,
  getProvinces,
  updateLocation,
} from "@/services/admin/locationsApi";
import { useCallback, useEffect, useState } from "react";

export function useLocations() {
  const [dataType, setDataType] = useState<
    "Country" | "Province" | "District" | "Ward"
  >("Country");
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [filterProvinceId, setFilterProvinceId] = useState<number | null>(null);
  const [filterDistrictId, setFilterDistrictId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState<BaseLocation[]>([]);
  const [meta, setMeta] = useState({
    totalItems: 0,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  });

  const [countries, setCountries] = useState<BaseLocation[]>([]);
  const [provinces, setProvinces] = useState<BaseLocation[]>([]);
  const [districts, setDistricts] = useState<BaseLocation[]>([]);

  const clearFilters = () => {
    setSelectedParent(null);
    setFilterProvinceId(null);
    setFilterDistrictId(null);
    setSearchTerm("");
    setPage(1);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const typeLower = dataType.toLowerCase() as LocationType;
      const params: any = {
        page,
        pageSize: 12,
        search: searchTerm,
      };

      if (selectedParent && selectedParent !== "all") {
        const pId = Number(selectedParent);
        if (dataType === "Province") params.countryId = pId;
        if (dataType === "District") params.provinceId = pId;
        if (dataType === "Ward") params.districtId = pId;
      }

      if (!params.provinceId && filterProvinceId && dataType === "District") {
        params.provinceId = filterProvinceId;
      }
      if (!params.districtId && filterDistrictId && dataType === "Ward") {
        params.districtId = filterDistrictId;
      }

      const res = await getLocationsByType(typeLower, params);

      setList(res.items);
      setMeta(res.meta);

      if (dataType !== "Country" && countries.length === 0) {
        const cRes = await getCountries({ pageSize: 1000 });
        setCountries(cRes.items);
      }
      if (
        (dataType === "District" || dataType === "Ward") &&
        provinces.length === 0
      ) {
        const pRes = await getProvinces({ pageSize: 1000 });
        setProvinces(pRes.items);
      }
      if (dataType === "Ward" && districts.length === 0) {
        const dRes = await getDistricts({ pageSize: 1000 });
        setDistricts(dRes.items);
      }
    } catch {
      toast({ variant: "destructive", title: "Không thể tải dữ liệu" });
    } finally {
      setLoading(false);
    }
  }, [
    dataType,
    selectedParent,
    filterProvinceId,
    filterDistrictId,
    page,
    searchTerm,
    countries.length,
    provinces.length,
    districts.length,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    setPage(1);
  }, [dataType, selectedParent, searchTerm]);

  const filteredList = list;

  const searchParents = async (
    type: "Province" | "District" | "Ward",
    search: string,
    parentId?: number,
  ) => {
    const params: any = { search, pageSize: 1000 };
    if (parentId) {
      if (type === "Province") params.countryId = parentId;
      if (type === "District") params.provinceId = parentId;
      if (type === "Ward") params.districtId = parentId;
    }

    if (type === "Province") {
      const res = await getProvinces(params);
      setProvinces(res.items);
    } else if (type === "District") {
      const res = await getDistricts(params);
      setDistricts(res.items);
    }
  };

  const create = async (
    type: "Country" | "Province" | "District" | "Ward",
    raw: any,
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
    raw: any,
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
    id: number,
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
    filterProvinceId,
    setFilterProvinceId,
    filterDistrictId,
    setFilterDistrictId,

    countries,
    provinces,
    districts,

    filteredList,
    loading,
    searchTerm,
    setSearchTerm,
    page,
    setPage,
    meta,

    fetchData,
    create,
    edit,
    remove,
    uploadProvinceImage,
    clearFilters,
  };
}
