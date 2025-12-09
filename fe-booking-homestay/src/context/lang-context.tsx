"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import en from "@/locales/en.json";
import vi from "@/locales/vi.json";

type LangType = "en" | "vi";
type Translations = typeof vi;

const translations: Record<LangType, Translations> = { en, vi };

interface LangContextType {
  lang: LangType;
  setLang: (lang: LangType) => void;
  t: (key: keyof Translations) => string;
}

const LangContext = createContext<LangContextType | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<LangType>("vi");

  const t = (key: keyof Translations) => translations[lang][key] || key;

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
