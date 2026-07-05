"use client";

import { useLang } from "@/context/lang-context";
import { Noti, useNotifications } from "@/context/notification-context";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  CheckCircle2,
  CreditCard,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function AdminNotificationList() {
  const {
    notifications,
    hasMore,
    fetchMoreNotifications,
    markAsRead,
    markAllRead,
  } = useNotifications();
  const router = useRouter();
  const { t } = useLang();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const isAdminNotificationType = (type: Noti["type"]) =>
    type === "ADMIN_BOOKING_CREATED" ||
    type === "ADMIN_BOOKING_CANCELLED" ||
    type === "ADMIN_BOOKING_WAITING_REFUND" ||
    type === "ADMIN_PAYMENT_SUCCESS" ||
    type === "ADMIN_CHECKIN_REMINDER";
  // type === "NEW_MESSAGE";
  const adminNotifications = notifications.filter((n) =>
    isAdminNotificationType(n.type),
  );
  const adminUnreadCount = adminNotifications.filter((n) => !n.read).length;
  const visibleNotifications = showUnreadOnly
    ? adminNotifications.filter((n) => !n.read)
    : adminNotifications;

  const handleItemClick = (n: Noti) => {
    if (!n.read) markAsRead([n.id]);
    if (n.data?.actionUrl) {
      router.push(n.data.actionUrl);
      return;
    }
    if (n.data?.targetType === "booking" && n.data?.targetId) {
      router.push(`/admin/bookings/${n.data.targetId}`);
      return;
    }
    if (n.data?.targetType === "conversation") {
      router.push("/admin/chat");
      return;
    }
    if (n.data?.bookingId) {
      router.push(`/admin/bookings/${n.data.bookingId}`);
    }
  };

  const getTranslatedTitle = (n: Noti) => {
    const typeKey = `noti_${n.type.toLowerCase()}_title` as any;
    const translated = t(typeKey);
    if (translated === typeKey) {
      return n.title;
    }
    return translated;
  };

  const getTranslatedBody = (n: Noti) => {
    const typeKey = `noti_${n.type.toLowerCase()}_body` as any;
    const params: Record<string, string | number> = {};
    if (n.data?.bookingId || n.data?.targetId) {
      params.bookingId = n.data.bookingId || n.data.targetId || 0;
    }
    params.paidAmount = n.data?.paidAmount
      ? Number(n.data.paidAmount).toLocaleString()
      : "";
    params.refundAmount = n.data?.refundAmount
      ? Number(n.data.refundAmount).toLocaleString()
      : "";
    params.guestName = n.data?.guestName || "";
    params.guestNameText = n.data?.guestName ? ` từ ${n.data.guestName} ` : "";
    params.paidAmountText = n.data?.paidAmount
      ? ` ${Number(n.data.paidAmount).toLocaleString()}`
      : "";
    params.refundAmountText = n.data?.refundAmount
      ? ` ${Number(n.data.refundAmount).toLocaleString()}`
      : "";

    const translated = t(typeKey, params);
    if (translated === typeKey) {
      return n.body;
    }
    return translated;
  };

  const iconMap: Partial<Record<Noti["type"], React.ReactElement>> = {
    ADMIN_BOOKING_CREATED: (
      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
    ),
    ADMIN_BOOKING_CANCELLED: (
      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
    ),
    ADMIN_PAYMENT_SUCCESS: (
      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" />
    ),
    ADMIN_CHECKIN_REMINDER: (
      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 shrink-0" />
    ),
    ADMIN_BOOKING_WAITING_REFUND: (
      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 shrink-0" />
    ),
  };
  const defaultIcon = (
    <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 shrink-0" />
  );

  const getIcon = (type: Noti["type"]) => {
    return iconMap[type] || defaultIcon;
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 pb-2">
        <strong className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
          {t("notification")}
        </strong>
        <div className="text-[10px] sm:text-xs text-muted-foreground bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full font-medium">
          {t("unread_count", { count: adminUnreadCount })}
        </div>
      </div>
      <div className="flex gap-3 px-2 mt-2 pb-1.5 border-b border-slate-55/60 dark:border-slate-800/40">
        <button
          className={`text-[11px] sm:text-xs font-semibold ${!showUnreadOnly ? "text-primary" : "text-muted-foreground"} cursor-pointer hover:text-primary transition-colors`}
          onClick={() => setShowUnreadOnly(false)}
        >
          {t("all")}
        </button>
        <button
          className={`text-[11px] sm:text-xs font-semibold ${showUnreadOnly ? "text-primary" : "text-muted-foreground"} cursor-pointer hover:text-primary transition-colors`}
          onClick={() => setShowUnreadOnly(true)}
        >
          {t("unread")}
        </button>
      </div>

      <div className="mt-1 max-h-72 overflow-y-auto beautiful-scrollbar divide-y divide-slate-100/70 dark:divide-slate-800/50">
        {adminNotifications.length === 0 && (
          <div className="p-6 text-xs text-muted-foreground text-center">
            {t("no_notifications")}
          </div>
        )}

        {adminNotifications.length !== 0 &&
          showUnreadOnly &&
          adminUnreadCount === 0 && (
            <div className="p-6 text-xs text-muted-foreground text-center">
              {t("no_notifications")}
            </div>
          )}

        {visibleNotifications.map((n) => (
          <motion.div
            key={n.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`p-2.5 sm:p-3 cursor-pointer ${n.read ? "" : "bg-primary/3 text-primary"} flex items-start gap-2.5 hover:bg-primary/5 dark:hover:bg-zinc-900/60 transition-all`}
            onClick={() => handleItemClick(n)}
          >
            <div className="shrink-0 pt-0.5">{getIcon(n.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {getTranslatedTitle(n)}
              </div>
              <div className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-relaxed">
                {getTranslatedBody(n)}
              </div>
              <div className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-end px-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-1">
        <button
          className="text-[11px] sm:text-xs font-semibold text-slate-500 hover:text-primary cursor-pointer transition-colors"
          onClick={markAllRead}
        >
          {t("mark_all_read")}
        </button>
      </div>
    </div>
  );
}
