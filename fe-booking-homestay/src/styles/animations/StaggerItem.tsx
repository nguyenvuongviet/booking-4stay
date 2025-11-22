"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

interface StaggerItemProps {
  children: React.ReactNode;
  index?: number;
  className?: string;
}

export default function StaggerItem({
  children,
  index = 0,
  className = "",
}: StaggerItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { margin: "-10% 0px" }); // trigger khi scroll gần 10% phần tử

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{
        duration: 0.5,
        ease: "easeOut",
        delay: index * 0.02, // stagger theo index, đơn vị giây
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
