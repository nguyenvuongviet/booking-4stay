"use client";

interface HoverLiftProps {
  children: React.ReactNode;
  className?: string;
}

export default function HoverLift({ children, className = "" }: HoverLiftProps) {
  return (
    <div
      className={`transition-all duration-500 ease-out 
                  hover:-translate-y-3 hover:shadow-2xl
                  ${className}`}
    >
      {children}
    </div>
  );
}
