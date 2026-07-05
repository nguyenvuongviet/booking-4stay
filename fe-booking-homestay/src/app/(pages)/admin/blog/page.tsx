"use client";

import {
  changePostStatus,
  deletePost,
  getAdminPosts,
  type AdminQueryParams,
} from "@/services/admin/blogApi";
import type { BlogPost } from "@/services/blogApi";
import {
  Archive,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Edit,
  Eye,
  FileText,
  Globe,
  Plus,
  RotateCw,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "../_components/Pagination";

const STATUS_CONFIG = {
  DRAFT: {
    label: "Nháp",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: FileText,
  },
  PUBLISHED: {
    label: "Đã xuất bản",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: Globe,
  },
  ARCHIVED: {
    label: "Lưu trữ",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: Archive,
  },
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "createdAt" | "viewCount" | "commentCount" | null
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>("desc");
  const [sortFilter, setSortFilter] = useState<string>("createdAt-desc");

  const [page, setPage] = useState(1);
  const pageSize = 10;

  const handleSort = (field: "createdAt" | "viewCount" | "commentCount") => {
    if (sortBy === field) {
      if (sortOrder === "desc") {
        setSortOrder("asc");
        setSortFilter(`${field}-asc`);
      } else {
        setSortBy(null);
        setSortOrder(null);
        setSortFilter("none");
      }
    } else {
      setSortBy(field);
      setSortOrder("desc");
      setSortFilter(`${field}-desc`);
    }
  };

  const renderSortIndicator = (
    field: "createdAt" | "viewCount" | "commentCount",
  ) => {
    if (sortBy !== field || !sortOrder) {
      return (
        <ArrowUpDown
          size={12}
          className="inline ml-1 opacity-40 group-hover:opacity-100 transition-opacity"
        />
      );
    }
    return sortOrder === "asc" ? (
      <ArrowUp size={12} className="inline ml-1 text-primary font-bold" />
    ) : (
      <ArrowDown size={12} className="inline ml-1 text-primary font-bold" />
    );
  };

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params: AdminQueryParams = {
        page: 1,
        pageSize: 1000,
      };
      if (search) params.search = search;
      if (statusFilter && statusFilter !== "ALL")
        params.status = statusFilter as "DRAFT" | "PUBLISHED" | "ARCHIVED";

      const data = await getAdminPosts(params);
      setPosts(data.items);
    } catch (err) {
      toast.error("Lỗi tải danh sách bài viết");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const processedPosts = useMemo(() => {
    let data = [...posts];

    if (!sortBy || !sortOrder) {
      return data;
    }

    // Sort
    data.sort((a, b) => {
      let valA: any = 0;
      let valB: any = 0;

      if (sortBy === "createdAt") {
        valA = a.publishedAt
          ? new Date(a.publishedAt).getTime()
          : new Date(a.createdAt).getTime();
        valB = b.publishedAt
          ? new Date(b.publishedAt).getTime()
          : new Date(b.createdAt).getTime();
      } else if (sortBy === "commentCount") {
        valA = a.commentCount || 0;
        valB = b.commentCount || 0;
      } else if (sortBy === "viewCount") {
        valA = a.viewCount || 0;
        valB = b.viewCount || 0;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [posts, sortBy, sortOrder]);

  const pageCount = Math.max(1, Math.ceil(processedPosts.length / pageSize));
  const pagedPosts = useMemo(() => {
    return processedPosts.slice((page - 1) * pageSize, page * pageSize);
  }, [processedPosts, page]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa bài viết này?")) return;
    try {
      await deletePost(id);
      toast.success("Đã xóa bài viết");
      fetchPosts();
    } catch {
      toast.error("Lỗi xóa bài viết");
    }
  };

  const handleStatusChange = async (
    id: number,
    newStatus: "DRAFT" | "PUBLISHED" | "ARCHIVED",
  ) => {
    try {
      await changePostStatus(id, newStatus);
      toast.success(`Đã chuyển sang ${STATUS_CONFIG[newStatus].label}`);
      fetchPosts();
    } catch {
      toast.error("Lỗi thay đổi trạng thái");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản lý Blog
          </h1>
          <p className="text-gray-600 dark:text-slate-400 mt-1">
            {processedPosts.length} bài viết
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchPosts()}
            disabled={loading}
            className="p-2.5 rounded-xl border bg-background hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer"
            title="Làm mới"
          >
            <RotateCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/blog/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
          >
            <Plus size={18} />
            Viết bài mới
          </Link>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex border-b border-muted">
        {[
          { key: "", label: "Tất cả bài viết" },
          { key: "DRAFT", label: "Nháp" },
          { key: "PUBLISHED", label: "Đã xuất bản" },
          { key: "ARCHIVED", label: "Lưu trữ" },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm bài viết..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Sort Select */}
        <select
          value={sortFilter}
          onChange={(e) => {
            const val = e.target.value;
            setSortFilter(val);
            if (val === "none") {
              setSortBy(null);
              setSortOrder(null);
            } else {
              const [field, order] = val.split("-");
              setSortBy(field as any);
              setSortOrder(order as "asc" | "desc");
            }
          }}
          className="px-4 py-2.5 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
        >
          <option value="none">Không sắp xếp</option>
          <option value="createdAt-desc">Mới nhất</option>
          <option value="createdAt-asc">Cũ nhất</option>
          <option value="viewCount-desc">Lượt xem: Nhiều nhất</option>
          <option value="viewCount-asc">Lượt xem: Ít nhất</option>
          <option value="commentCount-desc">Bình luận: Nhiều nhất</option>
          <option value="commentCount-asc">Bình luận: Ít nhất</option>
        </select>

        <div className="flex gap-2">
          <Link
            href="/admin/blog/categories"
            className="px-4 py-2.5 rounded-xl border bg-background text-sm font-medium hover:bg-accent transition-colors"
          >
            Danh mục &amp; Tags
          </Link>
          <Link
            href="/admin/blog/comments"
            className="px-4 py-2.5 rounded-xl border bg-background text-sm font-medium hover:bg-accent transition-colors"
          >
            Bình luận
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="border rounded-xl overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-primary/3 border-primary/20">
                <th
                  onClick={() => handleSort("createdAt")}
                  className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors group"
                >
                  Bài viết
                  {renderSortIndicator("createdAt")}
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Danh mục
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Trạng thái
                </th>
                <th
                  onClick={() => handleSort("viewCount")}
                  className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors group"
                >
                  Lượt xem
                  {renderSortIndicator("viewCount")}
                </th>
                <th
                  onClick={() => handleSort("commentCount")}
                  className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors group"
                >
                  Bình Luận
                  {renderSortIndicator("commentCount")}
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {loading &&
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b animate-pulse">
                    <td className="px-4 py-4" colSpan={6}>
                      <div className="h-10 bg-muted/20 rounded" />
                    </td>
                  </tr>
                ))}

              {!loading && processedPosts.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    Chưa có bài viết nào
                  </td>
                </tr>
              )}

              {!loading &&
                pagedPosts.map((post) => {
                  const status =
                    STATUS_CONFIG[post.status] || STATUS_CONFIG.DRAFT;

                  return (
                    <tr
                      key={post.id}
                      className="border-b hover:bg-muted/10 transition-colors"
                    >
                      {/* Post info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {post.thumbnailUrl &&
                          post.thumbnailUrl !== "null" &&
                          post.thumbnailUrl !== "undefined" ? (
                            <Image
                              src={post.thumbnailUrl}
                              alt=""
                              width={48}
                              height={48}
                              className="rounded-lg object-cover w-12 h-12"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center">
                              <FileText
                                size={18}
                                className="text-muted-foreground/40"
                              />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate max-w-75">
                              {post.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {post.publishedAt
                                ? new Date(post.publishedAt).toLocaleDateString(
                                    "vi-VN",
                                  )
                                : "Chưa xuất bản"}{" "}
                              · {post.readingTime || 5} phút đọc
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span className="text-sm">{post.category?.name}</span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <select
                          value={post.status}
                          onChange={(e) =>
                            handleStatusChange(
                              post.id,
                              e.target.value as
                                | "DRAFT"
                                | "PUBLISHED"
                                | "ARCHIVED",
                            )
                          }
                          className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer ${status.color}`}
                        >
                          <option value="DRAFT">Nháp</option>
                          <option value="PUBLISHED">Xuất bản</option>
                          <option value="ARCHIVED">Lưu trữ</option>
                        </select>
                      </td>

                      {/* Views */}
                      <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                        {post.viewCount?.toLocaleString() || 0}
                      </td>

                      {/* Comments */}
                      <td className="px-4 py-3 text-center text-sm">
                        <Link
                          href={`/admin/blog/comments?postId=${post.id}`}
                          className="inline-flex items-center justify-center min-w-7 h-7 px-2.5 rounded-full font-semibold bg-primary/10 text-primary hover:bg-primary hover:text-white hover:scale-110 hover:shadow-sm transition-all duration-200"
                          title="Quản lý bình luận của bài viết này"
                        >
                          {post.commentCount || 0}
                        </Link>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            title="Xem bài viết"
                          >
                            <Eye size={16} className="text-muted-foreground" />
                          </Link>
                          <Link
                            href={`/admin/blog/edit/${post.id}`}
                            className="p-2 rounded-lg hover:bg-accent transition-colors"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} className="text-primary" />
                          </Link>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={16} className="text-red-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="px-4 pb-4 bg-muted/10">
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
}
