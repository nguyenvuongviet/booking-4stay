"use client";

import { useAuth } from "@/context/auth-context";
import { checkBulkFavorites, toggleFavorite } from "@/services/favoriteApi";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Hook quản lý trạng thái yêu thích.
 * - Khi mount với roomIds → fetch bulk trạng thái từ server.
 * - toggle(roomId) → gọi API + cập nhật local state ngay (optimistic).
 */
export function useFavorites(roomIds: number[] = []) {
  const { user } = useAuth();
  const [favoriteMap, setFavoriteMap] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(false);
  const fetchedKeyRef = useRef<string>("");

  // Chuyển array thành string key ổn định để dùng làm dependency
  const idsKey = useMemo(
    () =>
      roomIds
        .filter((id) => typeof id === "number" && !isNaN(id) && id > 0)
        .sort((a, b) => a - b)
        .join(","),
    [roomIds],
  );

  // Fetch bulk trạng thái khi idsKey thay đổi
  useEffect(() => {
    if (!user || !idsKey) {
      // Không cần reset nếu đã rỗng
      if (Object.keys(favoriteMap).length > 0) {
        setFavoriteMap({});
      }
      fetchedKeyRef.current = "";
      return;
    }

    // Tránh fetch lại nếu cùng key
    if (idsKey === fetchedKeyRef.current) return;
    fetchedKeyRef.current = idsKey;

    let cancelled = false;
    const ids = idsKey.split(",").map(Number);

    (async () => {
      try {
        const result = await checkBulkFavorites(ids);
        if (!cancelled) {
          setFavoriteMap(result.favoriteMap || {});
        }
      } catch (err) {
        console.error("Check bulk favorites error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, idsKey]);

  // Toggle optimistic
  const toggle = useCallback(
    async (roomId: number) => {
      if (!user) return false;

      const prev = favoriteMap[roomId] || false;
      setFavoriteMap((m) => ({ ...m, [roomId]: !prev }));

      try {
        setLoading(true);
        const result = await toggleFavorite(roomId);
        setFavoriteMap((m) => ({ ...m, [roomId]: result.isFavorited }));
        return result.isFavorited;
      } catch (err) {
        setFavoriteMap((m) => ({ ...m, [roomId]: prev }));
        console.error("Toggle favorite error:", err);
        return prev;
      } finally {
        setLoading(false);
      }
    },
    [user, favoriteMap],
  );

  const isFavorited = useCallback(
    (roomId: number) => !!favoriteMap[roomId],
    [favoriteMap],
  );

  return { favoriteMap, toggle, isFavorited, loading };
}
