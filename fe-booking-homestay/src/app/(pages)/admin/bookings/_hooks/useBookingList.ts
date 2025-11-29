"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { getBookings } from "@/services/admin/bookingsApi";
import type { PaginatedBookings } from "@/types/booking";
import { DateRange } from "react-day-picker";

export function useBookingList() {
  const [loading, setLoading] = useState(true);
  const [raw, setRaw] = useState<PaginatedBookings | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [sortCheckIn, setSortCheckIn] = useState<"asc" | "desc" | null>(null);
  const [sortTotal, setSortTotal] = useState<"asc" | "desc" | null>(null);

  const pageSize = 6;
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBookings();
      setRaw(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getNights = (ci: string, co: string) => {
    const d1 = new Date(ci);
    const d2 = new Date(co);
    return Math.max(1, Math.round((d2.getTime() - d1.getTime()) / 86400000));
  };

  const processed = useMemo(() => {
    if (!raw) return [];

    let data = [...raw.items];

    data = data.filter((b) => {
      const g = b.guestInfo;
      const matchSearch =
        g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus =
        statusFilter === "all" ||
        b.status.toLowerCase() === statusFilter.toLowerCase();
      const matchDateFrom = dateRange?.from
        ? new Date(b.checkIn) >= dateRange.from
        : true;
      const matchDateTo = dateRange?.to
        ? new Date(b.checkIn) <= dateRange.to
        : true;

      return matchSearch && matchStatus && matchDateFrom && matchDateTo;
    });
    if (sortCheckIn) {
      data.sort((a, b) =>
        sortCheckIn === "asc"
          ? +new Date(a.checkIn) - +new Date(b.checkIn)
          : +new Date(b.checkIn) - +new Date(a.checkIn)
      );
    }
    if (sortTotal) {
      data.sort((a, b) =>
        sortTotal === "asc"
          ? (a.totalAmount ?? 0) - (b.totalAmount ?? 0)
          : (b.totalAmount ?? 0) - (a.totalAmount ?? 0)
      );
    }

    return data;
  }, [raw, searchTerm, statusFilter, dateRange, sortCheckIn, sortTotal]);

  const pageCount = Math.max(1, Math.ceil(processed.length / pageSize));
  const paged = processed.slice((page - 1) * pageSize, page * pageSize);

  return {
    loading,
    raw,
    processed,
    paged,

    searchTerm,
    setSearchTerm,

    statusFilter,
    setStatusFilter,

    dateRange,
    setDateRange,

    sortCheckIn,
    setSortCheckIn,

    sortTotal,
    setSortTotal,

    page,
    pageCount,
    setPage,

    getNights,
    refresh: load,
  };
}
