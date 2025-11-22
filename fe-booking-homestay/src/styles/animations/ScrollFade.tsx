"use client";

import { useEffect, useRef, useState } from "react";

interface ScrollFadeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // delay khi hiện text (ms)
}

export default function ScrollFade({
  children,
  className = "",
  delay = 200,
}: ScrollFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting); // scroll vào thì true, scroll ra thì false
      },
      { threshold: 0.8 } // trigger khi 80% phần tử hiện trong viewport
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${className} transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
