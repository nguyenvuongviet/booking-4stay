export type Message = {
  id: number;
  role: "assistant" | "user";
  content: string;
  time: string;
  isError?: boolean;
  isFallback?: boolean;
  source?: "gemini" | "fallback" | "stream";
  fallbackReason?: string;
};


