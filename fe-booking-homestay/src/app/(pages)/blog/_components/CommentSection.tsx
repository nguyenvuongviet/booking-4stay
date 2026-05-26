"use client";

import { useAuth } from "@/context/auth-context";
import {
  createComment,
  deleteComment,
  getComments,
  type BlogComment,
  type BlogPagination,
} from "@/services/blogApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
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
    fetchComments();
  }, [fetchComments]);

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

  return (
    <section className="bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-xs">
      <h2 className="text-xl font-bold tracking-tight mb-6 flex items-center gap-2 text-foreground">
        <MessageCircle size={22} className="text-primary" />
        Bình luận ({pagination.total})
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-3">
          {user ? (
            <div className="shrink-0">
              {user.avatar ? (
                <Image
                  src={user.avatar}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {user.firstName?.[0]}
                </div>
              )}
            </div>
          ) : null}
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={
                user ? "Viết bình luận của bạn..." : "Đăng nhập để bình luận..."
              }
              rows={3}
              maxLength={1000}
              className="w-full px-4 py-3 rounded-xl bg-muted/40 border border-muted/50 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/50"
              onClick={() => {
                if (!user) openSignIn();
              }}
            />
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">
                {newComment.length}/1000
              </span>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting || !user}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Send size={14} />
                )}
                Gửi
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      {loading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted/30" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted/30 rounded w-1/4" />
                <div className="h-4 bg-muted/20 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && comments.length === 0 && (
        <div className="text-center py-8">
          <MessageCircle
            size={40}
            className="mx-auto mb-3 text-muted-foreground/20"
          />
          <p className="text-sm text-muted-foreground">
            Chưa có bình luận nào. Hãy là người đầu tiên!
          </p>
        </div>
      )}

      <AnimatePresence>
        <div className="space-y-2.5">
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3 p-2.5 px-3.5 rounded-xl bg-muted/30 border border-muted/50 group"
            >
              <div className="shrink-0">
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
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-foreground">
                    {comment.user?.firstName} {comment.user?.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed wrap-break-word">
                  {comment.content}
                </p>
              </div>
              {/* Delete button for own comments */}
              {user && String(user.id) === String(comment.user?.id) && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all"
                  title="Xóa bình luận"
                >
                  <Trash2 size={14} />
                </button>
              )}
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
            className="p-1.5 rounded-xl bg-muted/40 border border-muted/50 disabled:opacity-30 hover:bg-accent/50 transition-colors"
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
                  className={`min-w-8 h-8 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    p === pagination.page
                      ? "bg-primary text-white shadow-xs"
                      : "bg-muted/40 border border-muted/50 hover:bg-accent/50"
                  }`}
                >
                  {p}
                </button>
              </span>
            ))}

          <button
            onClick={() => fetchComments(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="p-1.5 rounded-xl bg-muted/40 border border-muted/50 disabled:opacity-30 hover:bg-accent/50 transition-colors"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
