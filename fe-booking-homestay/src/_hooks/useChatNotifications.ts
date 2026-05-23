"use client";

import {
  getMessagePreview,
  isChatPage,
} from "@/_helper/chat-realtime.helper";
import { usePushNotifications } from "@/_hooks/usePushNotifications";
import { ChatNotificationPayload, IConversation } from "@/types/chat";
import { RefObject, useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";

type WindowWithWebkitAudio = Window & {
  webkitAudioContext?: typeof AudioContext;
};

type UseChatNotificationsParams = {
  enabled: boolean;
  userId?: string | number;
  pathnameRef: RefObject<string>;
  activeConversationRef: RefObject<IConversation | null>;
};

export function useChatNotifications({
  enabled,
  userId,
  pathnameRef,
  activeConversationRef,
}: UseChatNotificationsParams) {
  const toastCooldownRef = useRef<Map<number, number>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const originalTitleRef = useRef("");
  const blinkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  usePushNotifications(enabled);

  const stopTabBlinking = useCallback(() => {
    if (typeof window === "undefined") return;
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
    if (originalTitleRef.current) {
      document.title = originalTitleRef.current;
      originalTitleRef.current = "";
    }
  }, []);

  const startTabBlinking = useCallback((senderName?: string) => {
    if (typeof window === "undefined") return;
    if (document.hasFocus()) return;

    if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    if (!originalTitleRef.current) originalTitleRef.current = document.title;

    const newTitle = `Tin nhắn mới từ ${senderName ?? "4Stay"}💬`;
    let showMessage = true;

    blinkIntervalRef.current = setInterval(() => {
      document.title = showMessage ? newTitle : originalTitleRef.current;
      showMessage = !showMessage;
    }, 1000);
  }, []);

  const playNotificationSound = useCallback(() => {
    const playSynthesizedChime = () => {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as WindowWithWebkitAudio).webkitAudioContext;
        if (!AudioContextClass) return;
        const context = new AudioContextClass();

        const playBeep = (time: number, frequency: number, duration: number) => {
          const oscillator = context.createOscillator();
          const gainNode = context.createGain();
          oscillator.type = "sine";
          oscillator.frequency.value = frequency;
          gainNode.gain.setValueAtTime(0, time);
          gainNode.gain.linearRampToValueAtTime(1, time + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
          oscillator.connect(gainNode);
          gainNode.connect(context.destination);
          oscillator.start(time);
          oscillator.stop(time + duration);
        };

        const now = context.currentTime;
        playBeep(now, 587.33, 0.15);
        playBeep(now + 0.1, 880, 0.25);
      } catch (error) {
        console.warn("Lỗi phát âm thanh chime nhân tạo:", error);
      }
    };

    const audio = audioRef.current;
    if (!audio) {
      playSynthesizedChime();
      return;
    }

    audio.currentTime = 0;
    audio.volume = 1;
    audio.play().catch(playSynthesizedChime);
  }, []);

  const showMessageToast = useCallback(
    (payload: ChatNotificationPayload) => {
      const activeConversation = activeConversationRef.current;
      const shouldNotify =
        !isChatPage(pathnameRef.current) ||
        !activeConversation ||
        activeConversation.id !== payload.conversationId;

      if (!shouldNotify || String(payload.senderId) === String(userId)) return;

      const now = Date.now();
      const lastToastAt =
        toastCooldownRef.current.get(payload.conversationId) ?? 0;
      if (now - lastToastAt < 4000) return;

      toastCooldownRef.current.set(payload.conversationId, now);
      playNotificationSound();
      startTabBlinking(payload.senderName);

      toast.success(
        `Tin nhắn mới từ ${payload.senderName ?? "4Stay"}: "${getMessagePreview(
          payload.content,
        )}"`,
        {
          id: "inbox-notification",
          icon: "💬",
          duration: 3500,
        },
      );
    },
    [
      activeConversationRef,
      pathnameRef,
      playNotificationSound,
      startTabBlinking,
      userId,
    ],
  );

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.addEventListener("focus", stopTabBlinking);
    window.addEventListener("click", stopTabBlinking);

    return () => {
      window.removeEventListener("focus", stopTabBlinking);
      window.removeEventListener("click", stopTabBlinking);
      if (blinkIntervalRef.current) clearInterval(blinkIntervalRef.current);
    };
  }, [stopTabBlinking]);

  return { showMessageToast };
}
