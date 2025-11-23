import { STORAGE_KEYS } from "@/constants";

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.user ?? null;
  } catch {
    return null;
  }
}

export function isAdmin(user: any): boolean {
  if (!user) return false;
  const roles = Array.isArray(user.roles) ? user.roles : [];
  return roles.some((r: string) =>
    ["ADMIN", "SUPER_ADMIN", "OWNER"].includes(r.toUpperCase())
  );
}
