// Server-side fetch utilities for Blog — dùng native fetch() của Next.js
// Chỉ dùng trong Server Component, KHÔNG phụ thuộc axios hay localStorage

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3069";

// ==================== Helper ====================

async function fetchJSON<T>(
  path: string,
  options?: { revalidate?: number },
): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: options?.revalidate ?? 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return (json.data ?? json) as T;
  } catch {
    return null;
  }
}

// ==================== Types ====================

import type { BlogPost } from "./blogApi";
export type { BlogPost };

// ==================== Server Fetch Functions ====================

/** Fetch chi tiết bài viết theo slug (revalidate mỗi 60s) */
export async function fetchPostBySlug(slug: string): Promise<BlogPost | null> {
  return fetchJSON<BlogPost>(`/blog/posts/${slug}`);
}

/** Fetch bài viết liên quan */
export async function fetchRelatedPosts(
  slug: string,
  limit = 4,
): Promise<BlogPost[]> {
  const data = await fetchJSON<BlogPost[]>(
    `/blog/posts/related/${slug}?limit=${limit}`,
  );
  return data ?? [];
}
