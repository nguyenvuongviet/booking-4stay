export function sanitizeCollection<T>(
  data: T | T[],
  handler: (item: T) => any,
): any {
  if (!data) return null;
  return Array.isArray(data) ? data.map(handler) : handler(data);
}
