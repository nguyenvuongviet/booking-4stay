"use client";

import React from "react";
import { Check, X } from "lucide-react";

type Size = "xs" | "sm" | "md" | "lg";

interface FancySwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: Size;
  onColor?: string;
  offColor?: string;
  knobColor?: string;
  onIcon?: React.ReactNode;
  offIcon?: React.ReactNode;
}

export function FancySwitch({
  checked,
  onChange,
  size = "md",
  onColor = "bg-emerald-500",
  offColor = "bg-rose-400",
  knobColor = "bg-gray-50",
  onIcon = <Check className="w-3 h-3" />,
  offIcon = <X className="w-3 h-3" />,
}: FancySwitchProps) {
  const sizes = {
    xs: { w: "w-14", h: "h-7", knob: "h-5 w-5", translate: "translate-x-7" },
    sm: { w: "w-16", h: "h-8", knob: "h-6 w-6", translate: "translate-x-8" },
    md: { w: "w-20", h: "h-10", knob: "h-8 w-8", translate: "translate-x-10" },
    lg: {
      w: "w-24",
      h: "h-12",
      knob: "h-10 w-10",
      translate: "translate-x-12",
    },
  };

  const s = sizes[size];

  return (
    <label className="relative inline-flex items-center cursor-pointer select-none">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />

      <div
        className={`group peer ring-0 rounded-full outline-none duration-300 shadow-md ${
          s.w
        } ${s.h} ${checked ? onColor : offColor}`}
      >
        <div
          className={`absolute top-1 left-1 flex items-center justify-center duration-300 ${knobColor} ${
            s.knob
          } rounded-full peer-hover:scale-95 ${checked ? s.translate : ""}`}
        >
          {checked ? onIcon : offIcon}
        </div>
      </div>
    </label>
  );
}
