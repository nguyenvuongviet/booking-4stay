export function formatDate(date?: string | Date | null): string {
  if (!date) return "–";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "–";

  return d.toLocaleDateString("vi-VN");
}
