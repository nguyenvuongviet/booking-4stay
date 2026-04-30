export function formatDate(date?: string | Date | null): string {
  if (!date) return "–";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "–";

  return d.toLocaleDateString("vi-VN");
}

export function formatDateAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
