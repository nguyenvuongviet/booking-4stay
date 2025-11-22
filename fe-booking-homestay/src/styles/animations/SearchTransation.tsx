"use client";
import { motion } from "framer-motion";
import { useState } from "react";

export default function SearchTransition({ onSearch }: { onSearch: () => void }) {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true); 
    setTimeout(() => {
      onSearch();
    }, 300); 
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 1, scale: 1 }}
      animate={{
        opacity: isSearching ? 0.8 : 1,
        scale: isSearching ? 0.95 : 1,
        y: isSearching ? -50 : 0,
        borderRadius: isSearching ? "1rem" : "2rem",
      }}
      transition={{ duration: 0.3 }}
      className="bg-card p-8 shadow-xl"
    >
      {/* Form inputs */}
      <button onClick={handleSearch}>Search</button>
    </motion.div>
  );
}