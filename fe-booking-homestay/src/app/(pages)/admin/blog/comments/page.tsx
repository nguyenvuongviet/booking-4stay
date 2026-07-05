"use client";

import {
  deleteAdminComment,
  getAdminComments,
  updateAdminCommentStatus,
} from "@/services/admin/blogApi";
import type { BlogComment, BlogPagination } from "@/services/blogApi";
import { ChevronLeft, MessageCircle, RotateCw, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "../../_components/Pagination";

interface AdminComment extends BlogComment {
  post: { id: number; title: string; slug: string };
}

function CommentsListContent() {
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");

  const [activeStatus, setActiveStatus] = useState<"ALL" | "SPAM" | "REPORTED">(
    "ALL",
  );
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [pagination, setPagination] = useState<BlogPagination>({
    page: 1,
    pageSize: 5,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params: any = { page, pageSize: 5 };
        if (postId) {
          params.postId = Number(postId);
        }
        if (activeStatus === "REPORTED") {
          params.reported = "true";
        } else if (activeStatus !== "ALL") {
          params.status = activeStatus;
        }
        const data = await getAdminComments(params);
        setComments(data.items as AdminComment[]);
        setPagination(data.pagination);
      } catch {
        toast.error("Lỗi tải bình luận");
      } finally {
        setLoading(false);
      }
    },
    [postId, activeStatus],
  );

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleStatusChange = async (
    id: number,
    status: "APPROVED" | "SPAM",
    isClearingReports = false,
  ) => {
    try {
      await updateAdminCommentStatus(id, status);
      toast.success(
        isClearingReports
          ? "Đã duyệt bình luận thành công!"
          : status === "APPROVED"
            ? "Đã khôi phục bình luận thành công!"
            : "Đã đánh dấu là Spam",
      );
      fetchComments(pagination.page);
    } catch {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xóa bình luận này?")) return;
    try {
      await deleteAdminComment(id);
      toast.success("Đã xóa bình luận");
      fetchComments(pagination.page);
    } catch {
      toast.error("Lỗi xóa bình luận");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/admin/blog"
            className="-ml-2 p-2 rounded-lg hover:bg-accent transition-colors shrink-0"
          >
            <ChevronLeft size={20} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold truncate">
              Quản lý Bình luận
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {pagination.total} bình luận
            </p>
          </div>
        </div>
        <button
          onClick={() => fetchComments(pagination.page)}
          disabled={loading}
          className="p-2 sm:p-2.5 rounded-xl border bg-background hover:bg-accent transition-colors disabled:opacity-50 shrink-0"
          title="Làm mới"
        >
          <RotateCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {postId && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/20 text-xs sm:text-sm text-primary">
          <div className="min-w-0">
            <span className="font-medium text-foreground">
              Đang lọc bình luận cho bài viết
              {comments[0]?.post?.title ? (
                <>
                  :{" "}
                  <strong className="text-primary font-bold">
                    &quot;{comments[0].post.title}&quot;
                  </strong>
                </>
              ) : (
                ` (ID: ${postId})`
              )}
            </span>
          </div>
          <Link
            href="/admin/blog/comments"
            className="inline-flex items-center px-3 py-1.5 bg-background text-foreground border rounded-lg text-xs font-semibold hover:bg-accent transition-colors shrink-0"
          >
            Xem tất cả bình luận
          </Link>
        </div>
      )}

      {/* Status tabs */}
      <div className="flex border-b border-muted">
        {[
          { key: "ALL", label: "Tất cả" },
          { key: "REPORTED", label: "Bị báo cáo ⚠️" },
          { key: "SPAM", label: "Spam" },
        ].map((tab) => {
          const isActive = activeStatus === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveStatus(tab.key as any)}
              className={`px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all cursor-pointer ${
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

      <div className="border rounded-xl divide-y bg-background overflow-hidden">
        {loading &&
          [...Array(5)].map((_, i) => (
            <div key={i} className="p-4 animate-pulse">
              <div className="h-12 bg-muted/20 rounded" />
            </div>
          ))}

        {!loading && comments.length === 0 && (
          <div className="p-12 text-center">
            <MessageCircle
              size={40}
              className="mx-auto mb-3 text-muted-foreground/20"
            />
            <p className="text-muted-foreground">Chưa có bình luận nào</p>
          </div>
        )}

        {!loading &&
          comments.map((comment) => {
            const isReported =
              comment.reportCount !== undefined &&
              comment.reportCount > 0 &&
              comment.status !== "SPAM";
            return (
              <div
                key={comment.id}
                className={`p-3 sm:p-4 transition-colors group ${
                  isReported
                    ? "bg-rose-50/20 hover:bg-rose-50/30 border-l-4 border-l-red-500"
                    : "hover:bg-muted/5"
                }`}
              >
                <div className="flex gap-3 min-w-0 flex-1">
                  <div className="shrink-0 self-start">
                    {comment.user?.avatar ? (
                      <Image
                        src={comment.user.avatar}
                        alt=""
                        width={36}
                        height={36}
                        className="rounded-full object-cover w-9 h-9"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {comment.user?.firstName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-1">
                      <span className="text-sm font-semibold">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString(
                          "vi-VN",
                          {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                      {comment.status === "SPAM" && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border bg-gray-50 text-gray-600 border-gray-200/60">
                          Spam
                        </span>
                      )}
                      {isReported && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-rose-50 text-red-600 border-red-200/60 flex items-center gap-1 animate-pulse"
                          title={`${comment.reportCount} lượt báo cáo`}
                        >
                          🚩 Bị báo cáo: {comment.reportCount} lượt
                        </span>
                      )}
                    </div>
                    <p className="text-sm mb-2 wrap-break-word">
                      {comment.content}
                    </p>
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <Link
                        href={`/blog/${comment.post?.slug}`}
                        target="_blank"
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        📝 {comment.post?.title}
                      </Link>
                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5">
                        {isReported && comment.status !== "SPAM" && (
                          <button
                            onClick={() =>
                              handleStatusChange(comment.id, "APPROVED", true)
                            }
                            className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                            title="Phê duyệt bình luận (Xóa lượt báo cáo)"
                          >
                            Không sao
                          </button>
                        )}
                        {comment.status === "SPAM" ? (
                          <button
                            onClick={() =>
                              handleStatusChange(comment.id, "APPROVED", false)
                            }
                            className="px-2.5 py-1 text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-lg transition-colors cursor-pointer"
                            title="Khôi phục bình luận"
                          >
                            Khôi phục
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              handleStatusChange(comment.id, "SPAM")
                            }
                            className="px-2.5 py-1 text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer"
                            title="Đánh dấu là Spam"
                          >
                            Spam
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                          title="Xóa bình luận"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          page={pagination.page}
          pageCount={pagination.totalPages}
          onPageChange={fetchComments}
        />
      )}
    </div>
  );
}

export default function AdminCommentsPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-muted/20 rounded w-1/4" />
          <div className="h-40 bg-muted/20 rounded-xl" />
        </div>
      }
    >
      <CommentsListContent />
    </Suspense>
  );
}
