"use client";

import { getErrorMessage, getTime } from "@/_helper/chatbot.helper";
import { INITIAL_MESSAGES, STORAGE_KEY } from "@/constants/chatbot";
import { useAuth } from "@/context/auth-context";
import api from "@/services/api";
import { Message } from "@/types/chatbot";
import { useEffect, useRef, useState } from "react";

export function useChatbot() {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [close, setClose] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStorageKey, setActiveStorageKey] = useState(() =>
    `${STORAGE_KEY}:guest`
  );

  const bottomRef = useRef<HTMLDivElement | null>(null);
  const idCounter = useRef(100);
  const abortRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  const sessionIdRef = useRef<string>("guest-session");

  const nextId = () => ++idCounter.current;
  const getSessionId = (userId?: number | string | null) =>
    userId ? `session-${userId}` : "guest-session";
  const getStorageKey = (userId?: number | string | null) =>
    `${STORAGE_KEY}:${userId ? `user-${userId}` : "guest"}`;

  const loadHistory = (storageKey: string) => {
    if (typeof window === "undefined") return;

    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      setMessages(INITIAL_MESSAGES);
      idCounter.current = 100;
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        const valid = parsed.filter(
          (m) => m?.content && typeof m.content === "string"
        );

        setMessages([...INITIAL_MESSAGES, ...valid]);
        idCounter.current = Math.max(...valid.map((m) => m.id || 100), 100);
        return;
      }
    } catch {
      localStorage.removeItem(storageKey);
    }

    setMessages(INITIAL_MESSAGES);
    idCounter.current = 100;
  };

  // update session chat khi user thay đổi
  useEffect(() => {
    abortRef.current?.abort();
    requestIdRef.current += 1;
    setIsLoading(false);

    sessionIdRef.current = getSessionId(user?.id);
    const nextStorageKey = getStorageKey(user?.id);
    setActiveStorageKey(nextStorageKey);
    loadHistory(nextStorageKey);
  }, [user?.id]);

  // luu history
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (messages.length <= INITIAL_MESSAGES.length) return;

    const history = messages
      .filter((m) => m?.content && typeof m.content === "string")
      .filter((m) => !m.isError)
      .slice(INITIAL_MESSAGES.length);

    localStorage.setItem(activeStorageKey, JSON.stringify(history));
  }, [messages, activeStorageKey]);


  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, isLoading]);

  // send message
  const handleSend = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || isLoading) return;

    setInput("");
    setIsLoading(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    const userMessage: Message = {
      id: nextId(),
      role: "user",
      content: msg,
      time: getTime(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await api.post(
        "/chat",
        {
          sessionId: sessionIdRef.current,
          message: msg,
        },
        {
          headers: {
            Accept: "application/json",
          },
          signal: controller.signal,
        }
      );

      const data = res.data;
      if (requestId !== requestIdRef.current) return;

      const reply =
        data?.data?.reply ?? data?.reply ?? "";
      const isFallback = Boolean(data?.data?.isFallback ?? data?.isFallback);
      const source = data?.data?.source ?? data?.source;
      const fallbackReason =
        data?.data?.fallbackReason ?? data?.fallbackReason;

      if (!reply || typeof reply !== "string") {
        throw new Error("Empty response from server");
      }

      const botMessage: Message = {
        id: nextId(),
        role: "assistant",
        content: reply,
        time: getTime(),
        isFallback,
        source,
        fallbackReason,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      if (
        error instanceof Error &&
        (error.name === "AbortError" || error.name === "CanceledError")
      ) {
        return;
      }

      if ((error as any)?.code === "ERR_CANCELED") return;

      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: "assistant",
          content: getErrorMessage(error) || "Có lỗi xảy ra",
          time: getTime(),
          isError: true,
        },
      ]);
    } finally {
      if (requestId === requestIdRef.current) {
        abortRef.current = null;
        setIsLoading(false);
      }
    }
  };

  const clearHistory = () => {
    const currentSessionId = sessionIdRef.current;
    const currentStorageKey = activeStorageKey;

    abortRef.current?.abort();
    abortRef.current = null;
    requestIdRef.current += 1;
    setIsLoading(false);
    setMessages(INITIAL_MESSAGES);
    if (typeof window !== "undefined") {
      localStorage.removeItem(currentStorageKey);
    }
    idCounter.current = 100;
  };

  // cancel request
  const cancelRequest = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    requestIdRef.current += 1;
    setIsLoading(false);
  };

  return {
    open,
    setOpen,
    close,
    setClose,
    input,
    setInput,
    messages,
    isLoading,
    handleSend,
    clearHistory,
    cancelRequest,
    bottomRef,
  };
}
