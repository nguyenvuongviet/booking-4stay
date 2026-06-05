export const getTierColorClass = (
  tierName: string,
  variant: "badge" | "full" = "badge",
): string => {
  const normalized = (tierName || "").toUpperCase().trim();

  const standardColors: Record<string, { badge: string; full: string }> = {
    BRONZE: {
      badge: "bg-amber-50 text-amber-700 border border-amber-200",
      full: "bg-amber-100/60 text-amber-800 border border-amber-200/50",
    },
    SILVER: {
      badge: "bg-slate-50 text-slate-700 border border-slate-200",
      full: "bg-gray-200/60 text-gray-700 border border-gray-300/50",
    },
    GOLD: {
      badge: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      full: "bg-yellow-200/60 text-yellow-800 border border-yellow-300/50",
    },
    PLATINUM: {
      badge: "bg-blue-50 text-blue-700 border border-blue-200",
      full: "bg-blue-200/60 text-blue-800 border border-blue-300/50",
    },
    DIAMOND: {
      badge: "bg-sky-50 text-sky-800 border border-sky-200",
      full: "bg-sky-300/60 text-sky-900 border border-sky-400/50",
    },
  };

  if (standardColors[normalized]) {
    return standardColors[normalized][variant];
  }

  // Tự động sinh màu sắc hài hòa (Deterministic Palettes) đối với các hạng thành viên tự định nghĩa bởi Admin
  const dynamicPalettes = [
    {
      badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      full: "bg-emerald-100/60 text-emerald-800 border border-emerald-200/50",
    },
    {
      badge: "bg-rose-50 text-rose-700 border border-rose-200",
      full: "bg-rose-100/60 text-rose-800 border border-rose-200/50",
    },
    {
      badge: "bg-purple-50 text-purple-700 border border-purple-200",
      full: "bg-purple-100/60 text-purple-800 border border-purple-200/50",
    },
    {
      badge: "bg-indigo-50 text-indigo-700 border border-indigo-200",
      full: "bg-indigo-100/60 text-indigo-800 border border-indigo-200/50",
    },
    {
      badge: "bg-teal-50 text-teal-700 border border-teal-200",
      full: "bg-teal-100/60 text-teal-800 border border-teal-200/50",
    },
    {
      badge: "bg-orange-50 text-orange-700 border border-orange-200",
      full: "bg-orange-100/60 text-orange-800 border border-orange-200/50",
    },
    {
      badge: "bg-cyan-50 text-cyan-700 border border-cyan-200",
      full: "bg-cyan-100/60 text-cyan-800 border border-cyan-200/50",
    },
    {
      badge: "bg-pink-50 text-pink-700 border border-pink-200",
      full: "bg-pink-100/60 text-pink-800 border border-pink-200/50",
    },
  ];

  // Hash đơn giản từ tên hạng để sinh màu cố định cho cùng 1 tên
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % dynamicPalettes.length;
  return dynamicPalettes[index][variant];
};
