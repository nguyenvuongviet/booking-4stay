import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://booking-4stay.vercel.app";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

async function fetchPublishedPosts() {
  try {
    const res = await fetch(`${API_BASE}/blog/posts?pageSize=1000&page=1`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    if (!res.ok) return [];
    const resJson = await res.json();
    const items = resJson.data?.items || [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE}/blog/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const resJson = await res.json();
    const categories = resJson.data || [];
    return Array.isArray(categories) ? categories : [];
  } catch {
    return [];
  }
}


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories] = await Promise.all([
    fetchPublishedPosts(),
    fetchCategories(),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/room`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const postPages: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat: any) => ({
    url: `${BASE_URL}/blog?category=${cat.slug}`,
    lastModified: cat.updatedAt ? new Date(cat.updatedAt) : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...postPages, ...categoryPages];
}
