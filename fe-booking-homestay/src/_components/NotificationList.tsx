"use client";

import { useLang } from "@/context/lang-context";
import { Noti, useNotifications } from "@/context/notification-context";
import { motion } from "framer-motion";
import {
  Bell,
  Calendar,
  CheckCircle2,
  CreditCard,
  MessageSquare,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function NotificationList() {
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
  const isUserNotificationType = (type: Noti["type"]) =>
    !String(type).startsWith("ADMIN_");
  const userNotifications = notifications.filter((n) =>
    isUserNotificationType(n.type),
  );
  const userUnreadCount = userNotifications.filter((n) => !n.read).length;
  const visibleNotifications = showUnreadOnly
    ? userNotifications.filter((n) => !n.read)
    : userNotifications;

  const handleItemClick = (n: Noti) => {
    if (!n.read) markAsRead([n.id]);
    if (n.data?.actionUrl) {
      router.push(n.data.actionUrl);
      return;
    }
    if (n.data?.targetType === "booking" && n.data?.targetId) {
      router.push(`/booking/${n.data.targetId}`);
      return;
    }
    if (n.data?.targetType === "conversation") {
      router.push("/inbox");
      return;
    }
    if (n.data?.bookingId) {
      router.push(`/booking/${n.data.bookingId}`);
    }
  };

  const getTranslatedTitle = (n: Noti) => {
    const typeKey = `noti_${n.type.toLowerCase()}_title` as any;
    const translated = t(typeKey);
    if (translated === typeKey) {
      return n.title;
    }
    if (
      n.type === "BOOKING_CANCELLED" &&
      n.title.toLowerCase().includes("admin")
    ) {
      const adminTitleKey = "noti_booking_cancelled_title_admin" as any;
      const adminTranslated = t(adminTitleKey);
      if (adminTranslated !== adminTitleKey) {
        return adminTranslated;
      }
    }
    return translated;
  };

  const getTranslatedBody = (n: Noti) => {
    let keyStr = `noti_${n.type.toLowerCase()}_body`;
    if (
      n.type === "BOOKING_CANCELLED" &&
      n.title.toLowerCase().includes("admin")
    ) {
      keyStr = "noti_booking_cancelled_body_admin";
    }

    const typeKey = keyStr as any;
    const params: Record<string, string | number> = {};
    if (n.data?.bookingId || n.data?.targetId) {
      params.bookingId = n.data.bookingId || n.data.targetId || 0;
    }
    if (n.data?.paidAmount) {
      params.paidAmount = Number(n.data.paidAmount).toLocaleString();
    }

    if (
      n.type === "NEW_MESSAGE" &&
      n.body &&
      n.body !== "Ban co tin nhan moi" &&
      n.body !== "Bạn có tin nhắn mới"
    ) {
      return n.body;
    }

    const translated = t(typeKey, params);
    if (translated === typeKey) {
      return n.body;
    }
    return translated;
  };

  const iconMap: Partial<Record<Noti["type"], React.ReactElement>> = {
    BOOKING_CREATED: <CheckCircle2 className="text-green-500" size={20} />,
    BOOKING_CONFIRMED: <CheckCircle2 className="text-green-500" size={20} />,
    BOOKING_CANCELLED: <XCircle className="text-red-500" size={20} />,
    PAYMENT_SUCCESS: <CreditCard className="text-blue-500" size={20} />,
    CHECKIN_REMINDER: <Calendar className="text-purple-500" size={20} />,
    BOOKING_REFUNDED: <CheckCircle2 className="text-yellow-500" size={20} />,
    NEW_MESSAGE: <MessageSquare className="text-indigo-500" size={20} />,
  };
  const defaultIcon = <Bell className="text-gray-500" size={20} />;

  const getIcon = (type: Noti["type"]) => {
    return iconMap[type] || defaultIcon;
  };

  return (
    <div>
      <div className="flex items-center justify-between px-2 py-1">
        <strong>{t("notification")}</strong>
        <div className="text-xs text-muted-foreground">
          {t("unread_count", { count: userUnreadCount })}
        </div>
      </div>
      <div className="flex gap-2 px-2 mt-1">
        <button
          className={`text-xs ${!showUnreadOnly ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => setShowUnreadOnly(false)}
        >
          {t("all")}
        </button>
        <button
          className={`text-xs ${showUnreadOnly ? "text-primary" : "text-muted-foreground"}`}
          onClick={() => setShowUnreadOnly(true)}
        >
          {t("unread")}
        </button>
      </div>

      <div className="mt-2 max-h-80 overflow-auto beautiful-scrollbar">
        {userNotifications.length === 0 && (
          <div className="p-4 text-sm text-muted-foreground">
            {t("no_notifications")}
          </div>
        )}

        {showUnreadOnly && userUnreadCount === 0 && (
          <div className="p-4 text-sm text-muted-foreground text-center">
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
            transition={{ duration: 0.2 }}
            className={`p-3 border-b cursor-pointer ${n.read ? "" : "bg-primary/5 text-primary"} flex items-start gap-3 hover:bg-primary/10 dark:hover:bg-zinc-900 backdrop-filter backdrop-blur-sm`}
            onClick={() => handleItemClick(n)}
          >
            <div className="flex-shrink-0 pt-0.5">{getIcon(n.type)}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold">
                {getTranslatedTitle(n)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {getTranslatedBody(n)}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center justify-end px-2 pt-2">
        {/* <button
          className="text-xs text-primary disabled:text-muted-foreground"
          onClick={fetchMoreNotifications}
          disabled={!hasMore}
        >
          {t("load_more")}
        </button> */}
        <button
          className="text-xs text-muted-foreground hover:text-primary"
          onClick={markAllRead}
        >
          {t("mark_all_read")}
        </button>
      </div>
    </div>
  );
}
