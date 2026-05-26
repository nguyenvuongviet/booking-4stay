import api from "./api";

// ==================== Types ====================

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  thumbnailUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  promotionBanner?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured: boolean;
  viewCount: number;
  readingTime?: number;
  publishedAt?: string;
  createdAt: string;
  category: { id: number; name: string; slug: string };
  author: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  province?: { id: number; name: string };
  tags: { id: number; name: string; slug: string }[];
  commentCount?: number;
}

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  position: number;
  isActive: boolean;
  _count?: { posts: number };
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface BlogComment {
  id: number;
  content: string;
  status: "PENDING" | "APPROVED" | "SPAM";
  createdAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface BlogPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface BlogQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  categorySlug?: string;
  tagSlug?: string;
}

// ==================== Public Blog API ====================

export const getPosts = async (params?: BlogQueryParams) => {
  const res = await api.get("/blog/posts", { params });
  return res.data?.data as { items: BlogPost[]; pagination: BlogPagination };
};

export const getPostBySlug = async (slug: string) => {
  const res = await api.get(`/blog/posts/${slug}`);
  return res.data?.data as BlogPost;
};

export const getFeaturedPosts = async (limit = 4) => {
  const res = await api.get("/blog/posts/featured", { params: { limit } });
  return res.data?.data as BlogPost[];
};

export const getRelatedPosts = async (slug: string, limit = 4) => {
  const res = await api.get(`/blog/posts/related/${slug}`, {
    params: { limit },
  });
  return res.data?.data as BlogPost[];
};

export const getPostsByProvince = async (provinceId: number, limit = 3) => {
  const res = await api.get(`/blog/posts/by-province/${provinceId}`, {
    params: { limit },
  });
  return res.data?.data as BlogPost[];
};

export const getCategories = async () => {
  const res = await api.get("/blog/categories");
  return res.data?.data as BlogCategory[];
};

export const getTags = async () => {
  const res = await api.get("/blog/tags");
  return res.data?.data as BlogTag[];
};

export const incrementView = async (slug: string) => {
  const res = await api.patch(`/blog/posts/${slug}/view`);
  return res.data?.data;
};

// ==================== Comments ====================

export const getComments = async (
  slug: string,
  params: { page?: number; pageSize?: number } = {},
) => {
  const res = await api.get(`/blog/posts/${slug}/comments`, { params });
  return res.data?.data as { items: BlogComment[]; pagination: BlogPagination };
};

export const createComment = async (slug: string, content: string) => {
  const res = await api.post(`/blog/posts/${slug}/comments`, { content });
  return res.data?.data as BlogComment;
};

export const deleteComment = async (id: number) => {
  const res = await api.delete(`/blog/comments/${id}`);
  return res.data?.data;
};
