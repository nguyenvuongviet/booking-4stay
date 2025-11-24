"use client";

import { useEffect, useState } from "react";

interface TypingProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  pause?: number;
  loop?: boolean;
  className?: string;
}

export default function Typing({
  texts,
  speed = 80,
  deleteSpeed = 40,
  pause = 1000,
  loop = true,
  className,
}: TypingProps) {
  const [index, setIndex] = useState(0); // text index
  const [subIndex, setSubIndex] = useState(0); // character index
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!texts.length) return;

    if (!deleting && subIndex === texts[index].length) {
      const timeout = setTimeout(() => setDeleting(true), pause);
      return () => clearTimeout(timeout);
    }

    if (deleting && subIndex === 0) {
      setDeleting(false);
      setIndex(loop ? (index + 1) % texts.length : Math.min(index + 1, texts.length - 1));
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (deleting ? -1 : 1));
    }, deleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [subIndex, deleting, index, texts, speed, deleteSpeed, pause, loop]);

  return (
    <h1 className={className}>
      {texts[index].substring(0, subIndex)}
       <span className="cursor"></span>
      {/* <span className="border-r-2 border-current ml-1 animate-pulse"></span> */}
    </h1>
  );
}

