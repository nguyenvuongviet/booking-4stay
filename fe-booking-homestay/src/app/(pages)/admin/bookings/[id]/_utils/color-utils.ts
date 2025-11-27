export const getStatusColorClasses = (status: string): string => {
  const colorMap: Record<string, string> = {
    CONFIRMED: "bg-green-100 text-green-700 border border-green-200",
    PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    CHECKED_IN: "bg-blue-100 text-blue-700 border border-blue-200",
    CHECKED_OUT: "bg-gray-100 text-gray-700 border border-gray-200",
    CANCELLED: "bg-red-100 text-red-700 border border-red-200",
  };

  return colorMap[status] || "bg-muted text-foreground border border-input";
};
