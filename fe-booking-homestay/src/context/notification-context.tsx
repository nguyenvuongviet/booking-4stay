"use client";

import {
  getSocketUrl,
  getStoredAccessToken,
} from "@/_helper/chat-realtime.helper";
import { getPushPublicKey, savePushSubscription } from "@/services/chatApi";
import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { io, Socket } from "socket.io-client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export type Noti = {
  id: number;
  type:
    | "BOOKING_CREATED"
    | "BOOKING_CONFIRMED"
    | "BOOKING_CANCELLED"
    | "BOOKING_REFUNDED"
    | "PAYMENT_SUCCESS"
    | "CHECKIN_REMINDER"
    | "NEW_MESSAGE"
    | "ADMIN_BOOKING_CREATED"
    | "ADMIN_PAYMENT_SUCCESS"
    | "ADMIN_BOOKING_CANCELLED"
    | "ADMIN_CHECKIN_REMINDER"
    | "ADMIN_BOOKING_WAITING_REFUND";
  title: string;
  body: string;
  data?: {
    actionUrl?: string;
    targetType?: "booking" | "conversation";
    targetId?: number;
    bookingId?: number;
    conversationId?: number;
    paidAmount?: number;
    refundAmount?: number;
    guestName?: string;
    fromUserId?: number;
  };
  read: boolean;
  createdAt: string;
};

type Ctx = {
  notifications: Noti[];
  unreadCount: number;
  hasMore: boolean;
  fetchNotifications: () => Promise<void>;
  fetchMoreNotifications: () => Promise<void>;
  markAsRead: (ids: number[]) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationContext = createContext<Ctx | undefined>(undefined);

function isMessageNotification(type: Noti["type"]) {
  return type === "NEW_MESSAGE";
}

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Noti[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pushRegistrationAttempted, setPushRegistrationAttempted] =
    useState(false);

  const showForegroundBrowserNotification = async (notification: Noti) => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission !== "granted") return;
    if (isMessageNotification(notification.type)) return;
    if (document.visibilityState !== "visible") return;

    try {
      const registration =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.ready);

      await registration.showNotification(notification.title || "4Stay", {
        body: notification.body || "",
        icon: "/4stay-logo.png",
        badge: "/4stay-logo.png",
        tag: `notification-${notification.type}-${notification.id}`,
        data: {
          url: notification.data?.actionUrl || "/",
        },
      });
    } catch (error) {
      console.warn("Unable to show foreground browser notification", error);
    }
  };

  const applyListPayload = (payload: any, reset: boolean) => {
    const items: Noti[] = payload?.items || [];
    const pagination = payload?.pagination || {};

    setUnreadCount(Number(payload?.unreadCount || 0));
    setNextCursor(
      typeof pagination.nextCursor === "number" ? pagination.nextCursor : null,
    );
    setHasMore(Boolean(pagination.hasMore));
    setNotifications((prev) => (reset ? items : [...prev, ...items]));
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications?limit=20`);
      applyListPayload(res.data.data, true);
    } catch (err) {
      console.error("fetchNotifications error:", err);
    }
  };

  const fetchMoreNotifications = async () => {
    if (!nextCursor) return;
    try {
      const res = await api.get(`/notifications?limit=20&cursor=${nextCursor}`);
      applyListPayload(res.data.data, false);
    } catch (err) {
      console.error("fetchMoreNotifications error:", err);
    }
  };

  const markAsRead = async (ids: number[]) => {
    try {
      if (ids.length === 0) return;
      await api.post("/notifications/mark-read", { ids });
      let readDelta = 0;
      setNotifications((prev) =>
        prev.map((n) => {
          if (!n.read && ids.includes(n.id)) {
            readDelta += 1;
            return { ...n, read: true };
          }
          return n;
        }),
      );
      if (readDelta > 0) {
        setUnreadCount((prev) => Math.max(0, prev - readDelta));
      }
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.post("/notifications/mark-all-read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("markAllRead error:", err);
    }
  };

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setPushRegistrationAttempted(false);
      setNotifications([]);
      setUnreadCount(0);
      setNextCursor(null);
      setHasMore(false);
      return;
    }

    const token = getStoredAccessToken() || "";

    const s = io(`${getSocketUrl()}/notifications`, {
      auth: { token },
      transports: ["websocket"],
    });

    setSocket(s);

    s.on("connect", () => {
      fetchNotifications();
    });

    s.on("connect_error", (err) => {
      console.warn("[Socket Notifications] Connect error:", err.message);
      if (err.message === "jwt expired") {
        try {
          const newToken = getStoredAccessToken() || "";
          if (newToken && newToken !== (s.auth as any)?.token) {
            s.auth = { token: newToken };
            s.connect();
          }
        } catch {}
      }
    });

    s.on("notification", (payload: Noti) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload, ...prev].slice(0, 200);
      });

      if (!payload.read) {
        setUnreadCount((prev) => prev + 1);
      }

      showForegroundBrowserNotification(payload);
    });

    fetchNotifications();
    const syncInterval = window.setInterval(() => {
      fetchNotifications();
    }, 15000);

    return () => {
      window.clearInterval(syncInterval);
      s.disconnect();
      setSocket(null);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (typeof window === "undefined") return;
    if (
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      return;
    }

    let cancelled = false;

    const registerPush = async () => {
      try {
        const { publicKey, enabled } = await getPushPublicKey();
        if (!enabled || !publicKey || cancelled) return;

        const currentPermission = Notification.permission;
        const permission =
          currentPermission === "granted"
            ? currentPermission
            : await Notification.requestPermission();
        if (permission !== "granted" || cancelled) return;

        const registration = await navigator.serviceWorker.register("/sw.js");
        await navigator.serviceWorker.ready;
        await registration.update();
        const existing = await registration.pushManager.getSubscription();
        const subscription =
          existing ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          }));

        await savePushSubscription(subscription);
        setPushRegistrationAttempted(true);
      } catch (error) {
        console.warn("Unable to register notification push", error);
      }
    };

    if (Notification.permission === "granted") {
      registerPush();
      return () => {
        cancelled = true;
      };
    }

    if (pushRegistrationAttempted) {
      return () => {
        cancelled = true;
      };
    }

    const triggerRegistration = () => {
      if (cancelled) return;
      setPushRegistrationAttempted(true);
      registerPush();
      window.removeEventListener("click", triggerRegistration);
      window.removeEventListener("keydown", triggerRegistration);
      window.removeEventListener("touchstart", triggerRegistration);
    };

    window.addEventListener("click", triggerRegistration, { once: true });
    window.addEventListener("keydown", triggerRegistration, { once: true });
    window.addEventListener("touchstart", triggerRegistration, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("click", triggerRegistration);
      window.removeEventListener("keydown", triggerRegistration);
      window.removeEventListener("touchstart", triggerRegistration);
    };
  }, [pushRegistrationAttempted, user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasMore,
        fetchNotifications,
        fetchMoreNotifications,
        markAsRead,
        markAllRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used inside NotificationProvider",
    );
  }
  return ctx;
};
