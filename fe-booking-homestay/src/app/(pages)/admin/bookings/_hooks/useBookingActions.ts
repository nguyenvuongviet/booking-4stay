"use client";

import {
  acceptBooking,
  refundBooking,
  rejectBooking,
} from "@/services/admin/bookingsApi";
import { useState } from "react";
import toast from "react-hot-toast";

export type BookingActionMode = "accept" | "reject" | "refund";

interface ActionState {
  open: boolean;
  mode: BookingActionMode | null;
  id: number | null;
  maxAmount?: number;
}

export function useBookingActions(onSuccess?: () => void) {
  const [dialog, setDialog] = useState<ActionState>({
    open: false,
    mode: null,
    id: null,
  });

  const openAccept = (id: number) =>
    setDialog({ open: true, mode: "accept", id });

  const openReject = (id: number) =>
    setDialog({ open: true, mode: "reject", id });

  const openRefund = (id: number, maxAmount: number) =>
    setDialog({ open: true, mode: "refund", id, maxAmount });

  const closeDialog = () =>
    setDialog({ open: false, mode: null, id: null, maxAmount: undefined });

  async function handleConfirm(value: string) {
    try {
      if (!dialog.mode || !dialog.id) return;

      if (dialog.mode === "accept") {
        await acceptBooking(dialog.id, Number(value));
        toast.success("Duyệt booking thành công");
      }

      if (dialog.mode === "reject") {
        await rejectBooking(dialog.id, value);
        toast.success("Từ chối booking thành công");
      }

      if (dialog.mode === "refund") {
        await refundBooking(dialog.id, Number(value));
        toast.success("Hoàn tiền thành công");
      }

      onSuccess?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Thao tác thất bại";
      toast.error(msg);
    } finally {
      closeDialog();
    }
  }

  return {
    dialog,
    openAccept,
    openReject,
    openRefund,
    closeDialog,
    handleConfirm,
  };
}
