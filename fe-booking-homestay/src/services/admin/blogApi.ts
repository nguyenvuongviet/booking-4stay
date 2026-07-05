import api from "../api";
import type {
  BlogCategory,
  BlogComment,
  BlogPagination,
  BlogPost,
  BlogTag,
} from "../blogApi";

// ==================== Admin Types ====================

export interface CreatePostData {
  title: string;
  categoryId: number;
  provinceId?: number | null;
  excerpt?: string;
  content: string;
  thumbnailUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isFeatured?: boolean;
  tagIds?: number[];
}

export interface UpdatePostData extends Partial<CreatePostData> {}

export interface AdminQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

// ==================== Posts ====================

export const getAdminPosts = async (params?: AdminQueryParams) => {
  const res = await api.get("/admin/blog/posts", { params });
  return res.data?.data as { items: BlogPost[]; pagination: BlogPagination };
};

export const getAdminPostById = async (id: number) => {
  const res = await api.get(`/admin/blog/posts/${id}`);
  return res.data?.data as BlogPost;
};

export const createPost = async (data: CreatePostData) => {
  const res = await api.post("/admin/blog/posts", data);
  return res.data?.data as BlogPost;
};

export const updatePost = async (id: number, data: UpdatePostData) => {
  const res = await api.put(`/admin/blog/posts/${id}`, data);
  return res.data?.data as BlogPost;
};

export const deletePost = async (id: number) => {
  const res = await api.delete(`/admin/blog/posts/${id}`);
  return res.data?.data;
};

export const changePostStatus = async (
  id: number,
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
) => {
  const res = await api.patch(`/admin/blog/posts/${id}/status`, { status });
  return res.data?.data;
};

// ==================== Categories ====================

export const getAdminCategories = async () => {
  const res = await api.get("/admin/blog/categories");
  return res.data?.data as BlogCategory[];
};

export const createCategory = async (data: {
  name: string;
  description?: string;
  position?: number;
}) => {
  const res = await api.post("/admin/blog/categories", data);
  return res.data?.data as BlogCategory;
};

export const updateCategory = async (
  id: number,
  data: {
    name?: string;
    description?: string;
    position?: number;
    isActive?: boolean;
  },
) => {
  const res = await api.put(`/admin/blog/categories/${id}`, data);
  return res.data?.data as BlogCategory;
};

export const deleteCategory = async (id: number) => {
  const res = await api.delete(`/admin/blog/categories/${id}`);
  return res.data?.data;
};

// ==================== Tags ====================

export const getAdminTags = async () => {
  const res = await api.get("/admin/blog/tags");
  return res.data?.data as BlogTag[];
};

export const createTag = async (name: string) => {
  const res = await api.post("/admin/blog/tags", { name });
  return res.data?.data as BlogTag;
};

export const deleteTag = async (id: number) => {
  const res = await api.delete(`/admin/blog/tags/${id}`);
  return res.data?.data;
};

// ==================== Comments ====================

export const getAdminComments = async (params?: {
  page?: number;
  pageSize?: number;
  postId?: number;
  status?: string;
  reported?: string;
}) => {
  const res = await api.get("/admin/blog/comments", { params });
  return res.data?.data as {
    items: (BlogComment & {
      post: { id: number; title: string; slug: string };
    })[];
    pagination: BlogPagination;
  };
};

export const updateAdminCommentStatus = async (
  id: number,
  status: "PENDING" | "APPROVED" | "SPAM",
) => {
  const res = await api.patch(`/admin/blog/comments/${id}/status`, { status });
  return res.data?.data;
};

export const deleteAdminComment = async (id: number) => {
  const res = await api.delete(`/admin/blog/comments/${id}`);
  return res.data?.data;
};

export const upload_blog_image = async (data: FormData) => {
  const res = await api.post("/admin/blog/upload", data);
  return res.data;
};

export const delete_blog_image = async (imageUrl: string) => {
  const res = await api.delete("/admin/blog/upload", {
    data: { imageUrl },
  });
  return res.data;
};
