"use client";
import { useEffect, useState } from "react";
interface CountdownTimerProps {
  createdAt: string;
  expiryMinutes?: number;
  onFinish?: () => void; 
}
export default function CountdownTimer({ createdAt, expiryMinutes = 15, onFinish }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const startTime = new Date(createdAt).getTime();         // thời điểm đặt phòng
    const deadline = startTime + expiryMinutes * 60 * 1000;  // theo cấu hình AppConfig

    const timer = setInterval(() => {
      const now = Date.now();
      const difference = deadline - now;

      if (difference <= 0) {
        setTimeLeft("00:00");
        clearInterval(timer);
        onFinish?.();
        return;
      }

      const minutes = Math.floor(difference / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt,onFinish]);

  return (
    <span className="tabular-nums">{timeLeft}</span>
  );
}
