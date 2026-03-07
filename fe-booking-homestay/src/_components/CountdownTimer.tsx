"use client";
import { useEffect, useState } from "react";
interface CountdownTimerProps {
  createdAt: string;
  onFinish?: () => void; 
}
export default function CountdownTimer({ createdAt, onFinish }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const startTime = new Date(createdAt).getTime();         // thời điểm đặt phòng
    const deadline = startTime + 24 * 60 * 60 * 1000;         // +24 giờ

    const timer = setInterval(() => {
      const now = Date.now();
      const difference = deadline - now;

      if (difference <= 0) {
        setTimeLeft("00:00:00");
        clearInterval(timer);
        onFinish?.();
        return;
      }

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt,onFinish]);

  return (
    <div className=" text-yellow-700 text-center text-sm elegant-subheading">
      Thời gian thanh toán còn lại: <span className="elegant-sans text-base">{timeLeft}</span>
    </div>
  );
}
