"use client";

import { incrementView, type BlogPost } from "@/services/blogApi";
import { motion } from "framer-motion";
import {
  ArrowUp,
  Calendar,
  Clock,
  Eye,
  MessageCircle,
  Share2,
  Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CommentSection } from "../../_components/CommentSection";
import { RelatedRooms } from "../../_components/RelatedRooms";

// ==================== Table of Contents ====================

function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<
    { id: string; text: string; level: number }[]
  >([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const elements = doc.querySelectorAll("h2, h3");
    const items: { id: string; text: string; level: number }[] = [];

    elements.forEach((el, i) => {
      const id = `heading-${i}`;
      items.push({
        id,
        text: el.textContent || "",
        level: el.tagName === "H2" ? 2 : 3,
      });
    });

    setHeadings(items);
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -70% 0px" },
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav className="bg-card border border-border/60 rounded-2xl p-5">
      <h4 className="text-xs font-bold uppercase tracking-widest text-foreground mb-3">
        Mục lục
      </h4>
      <div className="space-y-1">
        {headings.map((h) => (
          <a
            key={h.id}
            href={`#${h.id}`}
            className={`block text-sm py-1.5 transition-all duration-200 border-l-2 ${
              h.level === 3 ? "pl-6" : "pl-3"
            } ${
              activeId === h.id
                ? "border-primary text-primary font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
            }`}
          >
            {h.text}
          </a>
        ))}
      </div>
    </nav>
  );
}

// ==================== Share Buttons ====================

function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareOptions = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color: "hover:bg-blue-500/10 hover:text-blue-600",
    },
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: "hover:bg-sky-500/10 hover:text-sky-600",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground mr-1">Chia sẻ:</span>
      {shareOptions.map((opt) => (
        <a
          key={opt.name}
          href={opt.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3 py-1.5 rounded-full bg-muted/50 border border-muted/60 text-xs font-medium transition-all duration-200 ${opt.color}`}
        >
          {opt.name}
        </a>
      ))}
      <button
        onClick={handleCopy}
        className="px-3 py-1.5 rounded-full bg-muted/50 border border-muted/60 text-xs font-medium hover:bg-accent/50 transition-all duration-200"
      >
        <Share2 size={12} className="inline mr-1" />
        Copy
      </button>
    </div>
  );
}

// ==================== Promotion Banner ====================

function PromotionBanner({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="my-8 p-6 rounded-2xl border border-amber-200/50 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, rgba(255,237,213,0.7), rgba(254,243,199,0.5))",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-300/20 rounded-full blur-[60px]" />
      <div className="relative flex items-start gap-3">
        <span className="text-2xl">🎁</span>
        <p className="text-sm font-medium text-amber-900">{text}</p>
      </div>
    </motion.div>
  );
}

// ==================== Main Client Component ====================

export default function BlogDetailClient({
  post,
  relatedPosts,
}: {
  post: BlogPost;
  relatedPosts: BlogPost[];
}) {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const articleRef = useRef<HTMLDivElement>(null);

  // Increment view count (client-side only)
  useEffect(() => {
    incrementView(post.slug).catch(() => {});
  }, [post.slug]);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add IDs to headings in rendered content
  useEffect(() => {
    if (!articleRef.current) return;
    const headings = articleRef.current.querySelectorAll("h2, h3");
    headings.forEach((el, i) => {
      el.id = `heading-${i}`;
    });
  }, [post.content]);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
          <Link href="/blog" className="hover:text-primary transition-colors">
            Blog
          </Link>
          <span>/</span>
          <Link
            href={`/blog?category=${post.category?.slug}`}
            className="hover:text-primary transition-colors"
          >
            {post.category?.name}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate max-w-50">
            {post.title}
          </span>
        </nav>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main article */}
          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <article className="bg-card border border-border/60 rounded-2xl p-6 md:p-10">
              {/* Header */}
              <header className="mb-8">
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <Link
                    href={`/blog?category=${post.category?.slug}`}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {post.category?.name}
                  </Link>
                  {post.tags?.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/blog?tag=${tag.slug}`}
                      className="px-2.5 py-1 rounded-full text-xs bg-muted/50 border border-muted/60 hover:bg-accent/50 transition-colors flex items-center gap-1"
                    >
                      <Tag size={10} />
                      {tag.name}
                    </Link>
                  ))}
                </div>

                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-foreground leading-tight">
                  {post.title}
                </h1>

                {/* Author + meta */}
                <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    {post.author?.avatar ? (
                      <Image
                        src={post.author.avatar}
                        alt=""
                        width={32}
                        height={32}
                        className="rounded-full object-cover h-9 w-9"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                        {post.author?.firstName?.[0]}
                      </div>
                    )}
                    <span className="font-medium text-foreground">
                      {post.author?.firstName} {post.author?.lastName}
                    </span>
                  </div>
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "Chưa xuất bản"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {post.readingTime || 5} phút đọc
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} />
                    {post.viewCount?.toLocaleString()} lượt xem
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={14} />
                    {post.commentCount || 0} bình luận
                  </span>
                </div>
              </header>

              {/* Thumbnail */}
              {post.thumbnailUrl && (
                <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8">
                  <Image
                    src={post.thumbnailUrl}
                    alt={post.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Promotion Banner */}
              {post.promotionBanner && (
                <PromotionBanner text={post.promotionBanner} />
              )}

              {/* Article content */}
              <div
                ref={articleRef}
                className="prose prose-lg max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground
                  prose-p:text-muted-foreground/95 prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-img:rounded-xl prose-img:shadow-md
                  prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-xl prose-blockquote:py-2 prose-blockquote:px-4
                  prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5
                  prose-strong:text-foreground
                  prose-li:text-muted-foreground
                "
                dangerouslySetInnerHTML={{ __html: post.content || "" }}
              />

              {/* Share buttons */}
              <div className="mt-10 pt-6 border-t border-border/50">
                <ShareButtons title={post.title} />
              </div>
            </article>

            {/* Related Rooms (Article-to-Room Linking) */}
            {post.province && (
              <div className="mt-8">
                <RelatedRooms
                  provinceId={post.province.id}
                  provinceName={post.province.name}
                />
              </div>
            )}

            {/* Related posts */}
            {relatedPosts.length > 0 && (
              <section className="mt-8">
                <h2 className="text-2xl font-bold tracking-tight mb-6 text-foreground">
                  Bài viết liên quan
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedPosts.map((rp) => (
                    <Link key={rp.id} href={`/blog/${rp.slug}`}>
                      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                        <div className="relative h-40 overflow-hidden">
                          {rp.thumbnailUrl ? (
                            <Image
                              src={rp.thumbnailUrl}
                              alt={rp.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 50vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-primary/10 to-accent/20" />
                          )}
                        </div>
                        <div className="p-4">
                          <span className="text-xs text-primary font-medium">
                            {rp.category?.name}
                          </span>
                          <h3 className="text-sm font-semibold mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                            {rp.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {rp.readingTime || 5} phút
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Comments */}
            <div className="mt-8">
              <CommentSection slug={post.slug} />
            </div>
          </motion.div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 order-first lg:order-last">
            <div className="lg:sticky lg:top-24 space-y-6">
              <TableOfContents content={post.content || ""} />

              {/* Author card */}
              <div className="bg-card border border-border/60 rounded-2xl p-5 text-center">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt=""
                    width={128}
                    height={128}
                    className="rounded-full object-cover h-32 w-32 mx-auto mb-3"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/20 mx-auto mb-3 flex items-center justify-center text-xl font-bold text-primary">
                    {post.author?.firstName?.[0]}
                  </div>
                )}
                <p className="font-semibold text-foreground">
                  {post.author?.firstName} {post.author?.lastName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Tác giả</p>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-card border border-border/60 shadow-lg hover:shadow-xl transition-all z-40"
        >
          <ArrowUp size={20} className="text-primary" />
        </motion.button>
      )}
    </>
  );
}
