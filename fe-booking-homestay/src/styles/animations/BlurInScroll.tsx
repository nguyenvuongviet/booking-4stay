"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface BlurInScrollProps {
  children: React.ReactNode;
  delay?: number; // ms
  className?: string;
}

export default function BlurInScroll({
  children,
  delay = 0,
  className = "",
}: BlurInScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-20% 0px" }); // trigger khi scroll gần 20% phần tử

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 20, filter: "blur(6px)" }}
      transition={{ duration: 0.7, delay: delay / 1000, ease: "easeOut" }} // delay theo giây
      className={className}
    >
      {children}
    </motion.div>
  );
}
