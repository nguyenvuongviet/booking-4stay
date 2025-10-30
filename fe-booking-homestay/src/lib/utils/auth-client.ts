import { STORAGE_KEYS } from "@/constants";

export type StoredUser =
  | { roles?: string[]; [k: string]: any }
  | { user?: { roles?: string[]; [k: string]: any }; [k: string]: any };

export function getCurrentUser(): StoredUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAdmin(obj: StoredUser | null): boolean {
  if (!obj) return false;
  const roles =
    (Array.isArray((obj as any).roles) && (obj as any).roles) ||
    (Array.isArray((obj as any).user?.roles) && (obj as any).user.roles) ||
    [];
  const upper = roles.map((r: any) => String(r).toUpperCase());
  return (
    upper.includes("ADMIN") ||
    upper.includes("SUPER_ADMIN") ||
    upper.includes("OWNER")
  );
}
