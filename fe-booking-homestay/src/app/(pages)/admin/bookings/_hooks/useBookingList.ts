"use client";

import { getBookings } from "@/services/admin/bookingsApi";
import type { PaginatedBookings } from "@/types/booking";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

export function useBookingList() {
  const [initialLoading, setInitialLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [raw, setRaw] = useState<PaginatedBookings | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const [sortCheckIn, setSortCheckIn] = useState<"asc" | "desc" | null>(null);
  const [sortTotal, setSortTotal] = useState<"asc" | "desc" | null>(null);

  const pageSize = 6;
  const [page, setPage] = useState(1);

  const loadInitial = useCallback(async () => {
    try {
      const data = await getBookings();
      setRaw(data);
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await getBookings();
      setRaw(data);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  useEffect(() => {
    const timer = setInterval(() => refresh(), 60000);
    return () => clearInterval(timer);
  }, [refresh]);

  const getNights = (ci: string, co: string) => {
    const ciDate = new Date(ci);
    const coDate = new Date(co);
    return Math.max(
      1,
      Math.round((coDate.getTime() - ciDate.getTime()) / 86400000)
    );
  };

  const processed = useMemo(() => {
    if (!raw) return [];

    let data = [...raw.items];

    data = data.filter((b) => {
      const g = b.guestInfo;
      const searchMatch =
        g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email.toLowerCase().includes(searchTerm.toLowerCase());

      const filterMatch =
        statusFilter === "ALL" ||
        b.status.toLowerCase() === statusFilter.toLowerCase();

      const dateFromMatch = dateRange?.from
        ? new Date(b.checkIn) >= dateRange.from
        : true;
      const dateToMatch = dateRange?.to
        ? new Date(b.checkIn) <= dateRange.to
        : true;

      return searchMatch && filterMatch && dateFromMatch && dateToMatch;
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
    initialLoading,
    refreshing,

    raw,
    paged,
    processed,
    page,
    pageCount,
    setPage,

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

    refresh,
    getNights,
  };
}
