"use client";
import { motion } from "framer-motion";
import { PropsWithChildren } from "react";

export default function HoverScale({
  children,
  scale = 1.02,
}: PropsWithChildren<{ scale?: number }>) {
  return (
    <motion.div
      whileHover={{ scale, y: -4 }}
      transition={{ type: "spring", stiffness: 160, damping: 14 }}
    >
      {children}
    </motion.div>
  );
}
