"use client";

import { usePathname } from "next/navigation";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

export default function PageTransition({ children }: PropsWithChildren) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip animation on first render to avoid initial flash
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Brief fade out then fade in on route change
    setIsVisible(false);
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }}
    >
      {children}
    </div>
  );
}
