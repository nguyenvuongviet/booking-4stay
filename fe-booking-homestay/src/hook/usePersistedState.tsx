"use client";
import { useState, useEffect } from "react";

export function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(defaultValue);

  // Load initial value từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch {
        localStorage.removeItem(key);
      }
    }
  }, [key]);

  const setPersistedState = (value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  return [state, setPersistedState] as const;
}
