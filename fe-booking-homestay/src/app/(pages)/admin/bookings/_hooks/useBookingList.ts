"use client";

import { getBookings } from "@/services/admin/bookingsApi";
import type { PaginatedBookings } from "@/types/booking";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";

export function useBookingList() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");

  const [initialLoading, setInitialLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [raw, setRaw] = useState<PaginatedBookings | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(() => {
    return statusParam ? statusParam.toUpperCase() : "ALL";
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (statusParam) {
      setStatusFilter(statusParam.toUpperCase());
    }
  }, [statusParam]);

  const [sortBy, setSortBy] = useState<
    "checkIn" | "checkOut" | "nights" | "guests" | "total" | null
  >(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const toggleSort = useCallback(
    (column: "checkIn" | "checkOut" | "nights" | "guests" | "total") => {
      if (sortBy !== column) {
        setSortBy(column);
        setSortOrder("desc");
      } else {
        if (sortOrder === "desc") {
          setSortOrder("asc");
        } else if (sortOrder === "asc") {
          setSortBy(null);
          setSortOrder(null);
        } else {
          setSortOrder("desc");
        }
      }
    },
    [sortBy, sortOrder],
  );

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
    setPage(1);
  }, [searchTerm, statusFilter, dateRange]);

  const getNights = (ci: string, co: string) => {
    const ciDate = new Date(ci);
    const coDate = new Date(co);
    return Math.max(
      1,
      Math.round((coDate.getTime() - ciDate.getTime()) / 86400000),
    );
  };

  const processed = useMemo(() => {
    if (!raw) return [];

    let data = [...raw.items];

    data = data.filter((b) => {
      const g = b.guestInfo;
      const searchMatch =
        g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (g.phoneNumber && g.phoneNumber.includes(searchTerm));

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
    if (sortBy && sortOrder) {
      data.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortBy === "checkIn") {
          valA = new Date(a.checkIn).getTime();
          valB = new Date(b.checkIn).getTime();
        } else if (sortBy === "checkOut") {
          valA = new Date(a.checkOut).getTime();
          valB = new Date(b.checkOut).getTime();
        } else if (sortBy === "nights") {
          valA = getNights(a.checkIn, a.checkOut);
          valB = getNights(b.checkIn, b.checkOut);
        } else if (sortBy === "guests") {
          valA = (a.adults ?? 0) + (a.children ?? 0);
          valB = (b.adults ?? 0) + (b.children ?? 0);
        } else if (sortBy === "total") {
          valA = a.totalAmount ?? 0;
          valB = b.totalAmount ?? 0;
        }

        if (valA < valB) return sortOrder === "asc" ? -1 : 1;
        if (valA > valB) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });
    }

    return data;
  }, [raw, searchTerm, statusFilter, dateRange, sortBy, sortOrder]);

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

    sortBy,
    sortOrder,
    toggleSort,

    refresh,
    getNights,
  };
}
