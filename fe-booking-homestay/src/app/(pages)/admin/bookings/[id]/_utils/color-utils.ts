export function getStatusColorClasses(status: string) {
  switch (status) {
    case "PENDING":
      return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    case "CONFIRMED":
      return "bg-green-100 text-green-800 border border-green-300";
    case "CHECKED_IN":
      return "bg-blue-100 text-blue-800 border border-blue-300";
    case "CHECKED_OUT":
      return "bg-purple-100 text-purple-800 border border-purple-300";
    case "CANCELLED":
      return "bg-red-100 text-red-800 border border-red-300";
    default:
      return "bg-gray-100 text-gray-600 border";
  }
}
