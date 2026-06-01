"use client";

import { toast } from "@/_components/ui/use-toast";
import { STORAGE_KEYS } from "@/constants";
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

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [notifications, setNotifications] = useState<Noti[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

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
      setNotifications([]);
      setUnreadCount(0);
      setNextCursor(null);
      setHasMore(false);
      return;
    }

    const token = (() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        return raw ? JSON.parse(raw).accessToken : "";
      } catch {
        return "";
      }
    })();

    const base = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;
    const s = io(`${base}/notifications`, {
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
          const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
          const newToken = raw ? JSON.parse(raw).accessToken : "";
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
        setUnreadCount((c) => (payload.read ? c : c + 1));
        toast({
          variant: "success",
          title: payload.title || "Thông báo mới",
          description: payload.body || "",
          duration: 4000,
        });
        return [payload, ...prev].slice(0, 200);
      });
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
