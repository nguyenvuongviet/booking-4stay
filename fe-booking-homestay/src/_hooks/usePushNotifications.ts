"use client";

import { getPushPublicKey, savePushSubscription } from "@/services/chatApi";
import { useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function usePushNotifications(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
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
        const { publicKey, enabled: pushEnabled } = await getPushPublicKey();
        if (!pushEnabled || !publicKey || cancelled) return;

        const permission = await Notification.requestPermission();
        if (permission !== "granted" || cancelled) return;

        // Đăng ký service worker (hoặc lấy registration đã có)
        const registration = await navigator.serviceWorker.register("/sw.js");

        // Force cập nhật SW để đảm bảo sw.js mới nhất được active
        await registration.update();

        // Chờ SW active xong
        await navigator.serviceWorker.ready;

        if (cancelled) return;

        // Lấy subscription cũ hoặc tạo mới
        let subscription = await registration.pushManager.getSubscription();
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        // LUÔN save subscription lên backend mỗi lần login/mount
        // Để đảm bảo backend có endpoint của user hiện tại
        await savePushSubscription(subscription);
      } catch (error) {
        console.warn("Unable to register push notifications", error);
      }
    };

    registerPush();

    return () => {
      cancelled = true;
    };
  }, [enabled]);
}

