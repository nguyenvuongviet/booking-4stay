"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface ScrollScaleProps {
  children: React.ReactNode;
  className?: string;
  delay?: number; // delay khi animate (giây)
}

export default function ScrollScale({
  children,
  className = "",
  delay = 0.05, // delay mặc định 0.05s
}: ScrollScaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-10% 0px" }); // trigger khi scroll gần vào

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 20, scale: 0.9 }}
      transition={{
        duration: 0.7,
        ease: "easeOut",
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
