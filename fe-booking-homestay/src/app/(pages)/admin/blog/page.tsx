"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import { Skeleton } from "@/_components/ui/skeleton";
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

  const [progress, setProgress] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

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
    if (!autoRefreshEnabled) {
      setProgress(0);
      return;
    }

    const duration = 15000;
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          fetchPosts();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, fetchPosts]);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 border-b gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản lý Blog
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-1">
            {processedPosts.length} bài viết
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`flex items-center gap-2 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border select-none cursor-pointer transition-all ${
              autoRefreshEnabled
                ? "bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
            }`}
            title={autoRefreshEnabled ? "Click để tạm dừng tự động làm mới" : "Click để bật tự động làm mới"}
          >
            <span className="relative flex h-1.5 w-1.5">
              {autoRefreshEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  autoRefreshEnabled ? "bg-emerald-500" : "bg-slate-400"
                }`}
              ></span>
            </span>
            <span>
              {autoRefreshEnabled
                ? `Làm mới sau ${Math.max(1, Math.ceil(15 - (progress * 15) / 100))}s`
                : "Tự động làm mới: Tắt"}
            </span>
          </div>

          <button
            onClick={async () => {
              await fetchPosts();
              setProgress(0);
            }}
            disabled={loading}
            className="p-2 sm:p-2.5 rounded-xl border bg-background hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer h-9 sm:h-10 flex items-center justify-center"
            title="Làm mới"
          >
            <RotateCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/blog/create"
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm cursor-pointer h-9 sm:h-10"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Viết bài mới</span>
            <span className="sm:hidden">Tạo mới</span>
          </Link>
        </div>
      </div>

      {/* Sleek Auto Refresh Progress Bar */}
      {autoRefreshEnabled && (
        <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden -mt-2 sm:-mt-3">
          <div
            className="h-full bg-primary/70 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Status tabs */}
      <div className="flex border-b border-muted overflow-x-auto scrollbar-none">
        {[
          { key: "", label: "Tất cả" },
          { key: "DRAFT", label: "Nháp" },
          { key: "PUBLISHED", label: "Đã xuất bản" },
          { key: "ARCHIVED", label: "Lưu trữ" },
        ].map((tab) => {
          const isActive = statusFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
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
      <div className="sticky top-16 sm:top-20 z-20 bg-background/95 backdrop-blur-xs border border-border p-3 sm:p-4 rounded-2xl shadow-sm flex flex-col gap-3">
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

        <div className="flex flex-wrap gap-2 sm:gap-3">
          {/* Sort Select */}
          <Select
            value={sortFilter}
            onValueChange={(val) => {
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
          >
            <SelectTrigger className="flex-1 min-w-35 sm:flex-none h-auto! px-4! py-2.5! rounded-xl! border! border-slate-200! dark:border-slate-800! bg-background text-sm font-medium hover:bg-accent transition-colors focus:ring-0 focus-visible:ring-0 focus-visible:border-slate-200 focus:border-slate-200 outline-none cursor-pointer shadow-none">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không sắp xếp</SelectItem>
              <SelectItem value="createdAt-desc">Mới nhất</SelectItem>
              <SelectItem value="createdAt-asc">Cũ nhất</SelectItem>
              <SelectItem value="viewCount-desc">Lượt xem ↑</SelectItem>
              <SelectItem value="viewCount-asc">Lượt xem ↓</SelectItem>
              <SelectItem value="commentCount-desc">Bình luận ↑</SelectItem>
              <SelectItem value="commentCount-asc">Bình luận ↓</SelectItem>
            </SelectContent>
          </Select>

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

      {/* ==================== Desktop Table (lg+) ==================== */}
      <div className="hidden lg:block border rounded-xl overflow-hidden bg-background">
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
                  <tr key={i} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
                        <div className="space-y-2 flex-1 min-w-0">
                          <Skeleton className="h-4 w-3/4 rounded" />
                          <Skeleton className="h-3 w-1/2 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20 rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-7 w-20 rounded-full" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Skeleton className="h-4 w-8 mx-auto rounded" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Skeleton className="h-7 w-8 mx-auto rounded-full" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="w-8 h-8 rounded-lg" />
                        <Skeleton className="w-8 h-8 rounded-lg" />
                      </div>
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
                        <Select
                          value={post.status}
                          onValueChange={(val) =>
                            handleStatusChange(
                              post.id,
                              val as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                            )
                          }
                        >
                          <SelectTrigger
                            size="sm"
                            className={`inline-flex items-center text-[11px] sm:text-xs font-semibold px-2 py-0 h-6! rounded-full border cursor-pointer shadow-none [&>svg]:size-3 [&>svg]:opacity-75 ${status.color}`}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Nháp</SelectItem>
                            <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                            <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                          </SelectContent>
                        </Select>
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

      {/* ==================== Mobile Card Layout (<lg) ==================== */}
      <div className="lg:hidden space-y-3">
        {loading &&
          [...Array(5)].map((_, i) => (
            <div
              key={i}
              className="border rounded-xl p-3 sm:p-4 bg-background space-y-3"
            >
              <div className="flex items-start gap-3">
                <Skeleton className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <Skeleton className="h-4 w-5/6 rounded" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-border/50 pt-3">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-4 w-16 ml-auto rounded" />
              </div>
              <div className="flex items-center justify-between border-t border-border/50 pt-3">
                <Skeleton className="h-8 w-24 rounded-full" />
                <div className="flex gap-1">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <Skeleton className="w-8 h-8 rounded-lg" />
                </div>
              </div>
            </div>
          ))}

        {!loading && processedPosts.length === 0 && (
          <div className="border rounded-xl p-8 sm:p-12 text-center text-muted-foreground bg-background">
            Chưa có bài viết nào
          </div>
        )}

        {!loading &&
          pagedPosts.map((post) => {
            const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.DRAFT;
            const StatusIcon = status.icon;

            return (
              <div
                key={post.id}
                className="border rounded-xl p-3 sm:p-4 bg-background hover:shadow-sm transition-shadow"
              >
                {/* Top: Thumbnail + Title + Date */}
                <div className="flex items-start gap-3">
                  {post.thumbnailUrl &&
                  post.thumbnailUrl !== "null" &&
                  post.thumbnailUrl !== "undefined" ? (
                    <Image
                      src={post.thumbnailUrl}
                      alt=""
                      width={56}
                      height={56}
                      className="rounded-lg object-cover w-12 h-12 sm:w-14 sm:h-14 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-muted/30 flex items-center justify-center shrink-0">
                      <FileText
                        size={18}
                        className="text-muted-foreground/40"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold line-clamp-2 leading-snug">
                      {post.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("vi-VN")
                        : "Chưa xuất bản"}{" "}
                      · {post.readingTime || 5} phút đọc
                    </p>
                  </div>
                </div>

                {/* Middle: Category + Status + Stats */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border/50">
                  {post.category?.name && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-muted/30">
                      {post.category.name}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${status.color}`}
                  >
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    👁 {post.viewCount?.toLocaleString() || 0} · 💬{" "}
                    {post.commentCount || 0}
                  </span>
                </div>

                {/* Bottom: Actions */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                  <Select
                    value={post.status}
                    onValueChange={(val) =>
                      handleStatusChange(
                        post.id,
                        val as "DRAFT" | "PUBLISHED" | "ARCHIVED",
                      )
                    }
                  >
                    <SelectTrigger
                      size="sm"
                      className={`inline-flex items-center text-[11px] sm:text-xs font-semibold px-2.5 py-0 h-6! rounded-full border cursor-pointer shadow-none [&>svg]:size-3 [&>svg]:opacity-75 ${status.color}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Nháp</SelectItem>
                      <SelectItem value="PUBLISHED">Xuất bản</SelectItem>
                      <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
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
                </div>
              </div>
            );
          })}

        {/* Pagination */}
        {pageCount > 1 && (
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
}
