"use client";

import { useAuth } from "@/context/auth-context";
import {
  createComment,
  deleteComment,
  getComments,
  reportComment,
  type BlogComment,
  type BlogPagination,
} from "@/services/blogApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Loader2,
  MessageCircle,
  Send,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

export function CommentSection({ slug }: { slug: string }) {
  const { user, openSignIn } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [pagination, setPagination] = useState<BlogPagination>({
    page: 1,
    pageSize: 5,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");

  const fetchComments = useCallback(
    async (page = 1) => {
      if (!slug || slug === "undefined") return;
      setLoading(true);
      try {
        const data = await getComments(slug, { page, pageSize: 5 });
        setComments(data.items);
        setPagination(data.pagination);
      } catch (err) {
        console.error("Error fetching comments:", err);
      } finally {
        setLoading(false);
      }
    },
    [slug],
  );

  useEffect(() => {
    if (slug && slug !== "undefined") {
      fetchComments();
    }
  }, [slug, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openSignIn();
      return;
    }
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await createComment(slug, newComment.trim());
      setNewComment("");
      toast.success("Đã đăng bình luận!");
      fetchComments(1); // Refresh to first page
    } catch (err) {
      toast.error("Không thể đăng bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteComment(id);
      toast.success("Đã xóa bình luận");
      fetchComments(pagination.page);
    } catch (err) {
      toast.error("Không thể xóa bình luận");
    }
  };

  const handleReport = async (id: number) => {
    try {
      await reportComment(id);
      toast.success("Báo cáo vi phạm đã được gửi!");
    } catch (err) {
      toast.error("Không thể gửi báo cáo vi phạm");
    }
  };

  return (
    <section className="py-2">
      <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2 text-foreground">
        <MessageCircle size={24} className="text-primary animate-pulse" />
        Bình luận ({pagination.total})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="group relative flex gap-3.5 p-4 rounded-2xl bg-card border border-border/70 focus-within:border-primary/30 focus-within:ring-4 focus-within:ring-primary/5 shadow-2xs transition-all duration-300">
          {user && (
            <div className="shrink-0 hidden sm:block">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt=""
                  width={36}
                  height={36}
                  className="rounded-full object-cover w-9 h-9 border border-border/60"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                  {user.firstName?.[0]}
                </div>
              )}
            </div>
          )}
          <div className="flex-1 flex flex-col justify-between min-w-0">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                user ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận..."
              }
              rows={3}
              maxLength={1000}
              className="w-full bg-transparent border-0 p-0 text-sm resize-none focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50 text-foreground"
              onClick={() => {
                if (!user) openSignIn();
              }}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
              <div className="flex items-center gap-2">
                {user && (
                  <div className="sm:hidden shrink-0">
                    {user.avatar ? (
                      <Image
                        src={user.avatar}
                        alt=""
                        width={24}
                        height={24}
                        className="rounded-full object-cover w-6 h-6 border border-border/60"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {user.firstName?.[0]}
                      </div>
                    )}
                  </div>
                )}
                <span className="text-[10px] text-muted-foreground/70 font-medium">
                  {newComment.length}/1000 ký tự
                </span>
              </div>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting || !user}
                className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-primary text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/95 hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-primary/15 cursor-pointer"
              >
                {submitting ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Send size={12} />
                )}
                Gửi bình luận
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex gap-4 animate-pulse pb-6 border-b border-border/40"
            >
              <div className="w-9 h-9 rounded-full bg-muted/30" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted/30 rounded w-1/4" />
                <div className="h-4 bg-muted/20 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-center py-10 bg-muted/10 rounded-2xl border border-dashed border-border/80">
          <MessageCircle
            size={36}
            className="mx-auto mb-2 text-muted-foreground/30"
          />
          <p className="text-xs text-muted-foreground font-medium">
            Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ ý kiến!
          </p>
        </div>
      )}

      <AnimatePresence>
        <div className="space-y-6">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-4 pb-6 border-b border-border/40 last:border-0 last:pb-0 last:mb-0 group"
            >
              <div className="shrink-0">
                {comment.user?.avatar ? (
                  <Image
                    src={comment.user.avatar}
                    alt=""
                    width={36}
                    height={36}
                    className="rounded-full object-cover w-9 h-9 border border-border/60"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary border border-primary/20">
                    {comment.user?.firstName?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 min-w-0">
                    <span className="text-sm font-semibold text-foreground leading-tight truncate">
                      {comment.user?.firstName} {comment.user?.lastName}
                    </span>
                    <span className="text-[10px] text-muted-foreground/75 leading-none shrink-0">
                      {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-1 shrink-0 opacity-60 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 self-center">
                    {user && String(user.id) === String(comment.user?.id) && (
                      <button
                        onClick={() => handleDelete(comment.id)}
                        className="p-1 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all duration-200 cursor-pointer"
                        title="Xóa bình luận"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    {(!user ||
                      String(user.id) !== String(comment.user?.id)) && (
                      <button
                        onClick={() => handleReport(comment.id)}
                        className="p-1 rounded-md hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 transition-all duration-200 cursor-pointer"
                        title="Báo cáo vi phạm"
                      >
                        <Flag size={13} />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground/90 leading-relaxed wrap-break-word whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => fetchComments(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="p-2 rounded-xl bg-card border border-border/70 disabled:opacity-35 hover:bg-primary/8 hover:text-primary hover:border-primary/30 transition-all duration-200 cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
            .filter(
              (p) =>
                p === 1 ||
                p === pagination.totalPages ||
                Math.abs(p - pagination.page) <= 2,
            )
            .map((p, idx, arr) => (
              <span key={p} className="flex items-center">
                {idx > 0 && arr[idx - 1] !== p - 1 && (
                  <span className="px-1 text-muted-foreground text-xs">
                    •••
                  </span>
                )}
                <button
                  onClick={() => fetchComments(p)}
                  className={`min-w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                    p === pagination.page
                      ? "bg-primary text-white shadow-md shadow-primary/15"
                      : "bg-card border border-border/70 hover:bg-primary/8 hover:text-primary hover:border-primary/30"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}

          <button
            onClick={() => fetchComments(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-2 rounded-xl bg-card border border-border/70 disabled:opacity-35 hover:bg-primary/8 hover:text-primary hover:border-primary/30 transition-all duration-200 cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
