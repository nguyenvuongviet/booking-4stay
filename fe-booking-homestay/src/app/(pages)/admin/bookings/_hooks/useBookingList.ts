"use client";

import {
  acceptBooking,
  getBookings,
  rejectBooking,
} from "@/services/admin/bookingsApi";
import type { PaginatedBookings } from "@/types/booking";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import toast from "react-hot-toast";

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

  useEffect(() => {
    const timer = setInterval(() => load(), 60000);
    return () => clearInterval(timer);
  }, [load]);

  const accept = async (id: number) => {
    const paidAmount = prompt("Số tiền khách đã trả:");
    if (!paidAmount) return;
    try {
      await acceptBooking(id, parseInt(paidAmount, 10));
      toast.success("Duyệt booking thành công");
      await load();
    } catch (err) {
      toast.error("Không thể duyệt booking");
    }
  };

  const reject = async (id: number) => {
    const reason = prompt("Nhập lý do từ chối:");
    if (!reason) return;

    try {
      await rejectBooking(id, reason);
      toast.success("Từ chối booking thành công");
      await load();
    } catch (err) {
      toast.error("Không thể từ chối booking");
    }
  };

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
        statusFilter === "all" ||
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
    loading,
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

    refresh: load,
    getNights,
    accept,
    reject,
  };
}
