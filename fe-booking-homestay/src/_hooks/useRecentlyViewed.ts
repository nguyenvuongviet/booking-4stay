"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "recently_viewed_rooms";
const MAX_ITEMS = 10;

export interface RecentRoom {
  roomId: number;
  viewedAt: string;
}

/**
 * Hook quản lý danh sách phòng đã xem gần đây (localStorage).
 * - trackView(roomId): Ghi nhận user vừa xem phòng.
 * - recentRooms: Danh sách roomIds đã xem, mới nhất trước.
 */
export function useRecentlyViewed() {
  const [recentRooms, setRecentRooms] = useState<RecentRoom[]>([]);
  const initialized = useRef(false);

  // Đọc từ localStorage khi mount (chỉ chạy 1 lần)
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: RecentRoom[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentRooms(parsed);
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  // Ghi nhận phòng mới xem
  const trackView = useCallback((roomId: number) => {
    if (!roomId || isNaN(roomId)) return;

    setRecentRooms((prev) => {
      const filtered = prev.filter((r) => r.roomId !== roomId);
      const updated = [
        { roomId, viewedAt: new Date().toISOString() },
        ...filtered,
      ].slice(0, MAX_ITEMS);

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // localStorage full or unavailable
      }

      return updated;
    });
  }, []);

  // Xoá toàn bộ lịch sử
  const clearHistory = useCallback(() => {
    setRecentRooms([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Memoize recentRoomIds — chỉ thay đổi khi recentRooms thật sự thay đổi
  const recentRoomIds = useMemo(
    () => recentRooms.map((r) => r.roomId),
    [recentRooms],
  );

  // Tạo stable string key cho dependency (tránh reference mới mỗi render)
  const idsKey = useMemo(() => recentRoomIds.join(","), [recentRoomIds]);

  return {
    recentRooms,
    recentRoomIds,
    idsKey,
    trackView,
    clearHistory,
    hasRecent: recentRooms.length > 0,
  };
}
