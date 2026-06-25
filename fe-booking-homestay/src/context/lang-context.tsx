"use client";

import en from "@/locales/en.json";
import vi from "@/locales/vi.json";
import { createContext, ReactNode, useContext, useState } from "react";

type LangType = "en" | "vi";
type Translations = typeof vi;

const translations: Record<LangType, Translations> = { en, vi };

interface LangContextType {
  lang: LangType;
  setLang: (lang: LangType) => void;
  t: (
    key: keyof Translations,
    params?: Record<string, string | number>,
  ) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangType>("vi");

  const t = (
    key: keyof Translations,
    params?: Record<string, string | number>,
  ) => {
    let text = translations[lang][key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, "g"), String(v));
      });
    }
    return text;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => {
  const context = useContext(LangContext);
  if (!context) throw new Error("useLang must be used within LangProvider");
  return context;
};
