"use client";

import { useEffect, useState } from "react";
import {
  getCountries,
  getProvinces,
  getDistricts,
  getWards,
} from "@/services/admin/locationsApi";

export interface LocationValue {
  countryId: string | number | null;
  provinceId: string | number | null;
  districtId: string | number | null;
  wardId: string | number | null;
}

export function useLocationSelector(initial?: Partial<LocationValue>) {
  const [countries, setCountries] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  const [value, setValue] = useState<LocationValue>({
    countryId: initial?.countryId ?? null,
    provinceId: initial?.provinceId ?? null,
    districtId: initial?.districtId ?? null,
    wardId: initial?.wardId ?? null,
  });

  useEffect(() => {
    (async () => {
      const res = await getCountries({ page: 1, pageSize: 100 });
      setCountries(res?.items || []);
    })();
  }, []);

  useEffect(() => {
    if (!value.countryId) {
      setProvinces([]);
      return;
    }
    (async () => {
      const res = await getProvinces({
        countryId: Number(value.countryId),
        page: 1,
        pageSize: 100,
      });
      setProvinces(res?.items || []);
    })();
  }, [value.countryId]);

  useEffect(() => {
    if (!value.provinceId) {
      setDistricts([]);
      return;
    }
    (async () => {
      const res = await getDistricts({
        provinceId: Number(value.provinceId),
        page: 1,
        pageSize: 100,
      });
      setDistricts(res?.items || []);
    })();
  }, [value.provinceId]);

  useEffect(() => {
    if (!value.districtId) {
      setWards([]);
      return;
    }
    (async () => {
      const res = await getWards({
        districtId: Number(value.districtId),
        page: 1,
        pageSize: 100,
      });
      setWards(res?.items || []);
    })();
  }, [value.districtId]);

  const update = (key: keyof LocationValue, val: string | number | null) => {
    setValue((prev) => {
      const next = { ...prev, [key]: val };

      if (key === "countryId") {
        next.provinceId = null;
        next.districtId = null;
        next.wardId = null;
      }
      if (key === "provinceId") {
        next.districtId = null;
        next.wardId = null;
      }
      if (key === "districtId") {
        next.wardId = null;
      }

      return next;
    });
  };

  return {
    value,
    update,
    countries,
    provinces,
    districts,
    wards,
  };
}
