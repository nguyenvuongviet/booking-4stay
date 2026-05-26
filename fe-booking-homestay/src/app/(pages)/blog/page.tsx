"use client";

import {
  getCategories,
  getFeaturedPosts,
  getPosts,
  type BlogCategory,
  type BlogPagination,
  type BlogPost,
} from "@/services/blogApi";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  MessageCircle,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

// ==================== Animation Variants ====================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
} as const;

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
} as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

// ==================== Sub-Components ====================

function BlogHero({ featuredPosts }: { featuredPosts: BlogPost[] }) {
  const mainPost = featuredPosts[0];
  if (!mainPost) return null;

  return (
    <section className="relative overflow-hidden py-16 md:py-24 border-b border-border/40">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-background" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-400/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-foreground">
            Khám phá Việt Nam
            <br />
            <span className="bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              cùng 4Stay
            </span>
          </h1>
          <p className="text-lg text-muted-foreground/95 max-w-2xl mx-auto font-normal">
            Chia sẻ kinh nghiệm, cẩm nang du lịch và review homestay hữu ích
            nhất dành cho bạn.
          </p>
        </motion.div>

        {/* Featured post card */}
        {mainPost && (
          <motion.div
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <Link href={`/blog/${mainPost.slug}`}>
              <div className="bg-card border border-border/60 rounded-2xl overflow-hidden group cursor-pointer hover:shadow-xl hover:border-primary/20 transition-all duration-500">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative h-64 md:h-96 overflow-hidden">
                    {mainPost.thumbnailUrl ? (
                      <Image
                        src={mainPost.thumbnailUrl}
                        alt={mainPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-linear-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                        <Sparkles size={48} className="text-primary/50" />
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-xs">
                        Nổi bật
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-muted/60 border border-muted/70 text-foreground">
                        {mainPost.category?.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4 group-hover:text-primary transition-colors">
                      {mainPost.title}
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                      {mainPost.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {mainPost.readingTime || 5} phút đọc
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Eye size={14} />
                        {mainPost.viewCount?.toLocaleString() || 0}
                      </span>
                      {mainPost.author && (
                        <span className="flex items-center gap-1.5">
                          {mainPost.author.avatar ? (
                            <Image
                              src={mainPost.author.avatar}
                              alt=""
                              width={20}
                              height={20}
                              className="rounded-full h-7 w-7 object-cover"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-primary/20" />
                          )}
                          {mainPost.author.firstName} {mainPost.author.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  return (
    <motion.div variants={cardVariants}>
      <Link href={`/blog/${post.slug}`}>
        <article className="bg-card border border-border/60 rounded-2xl overflow-hidden group cursor-pointer h-full flex flex-col hover:shadow-lg hover:border-primary/20 transition-all duration-500 hover:-translate-y-1">
          {/* Thumbnail */}
          <div className="relative h-52 overflow-hidden">
            {post.thumbnailUrl ? (
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                <TrendingUp size={32} className="text-primary/40" />
              </div>
            )}
            <div className="absolute top-3 left-3">
              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted/60 border border-muted/70 text-foreground backdrop-blur-xs">
                {post.category?.name}
              </span>
            </div>
            {post.isFeatured && (
              <div className="absolute top-3 right-3">
                <Sparkles size={16} className="text-amber-400 drop-shadow-lg" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
              {post.title}
            </h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1 leading-relaxed">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {post.readingTime || 5} phút
                </span>
                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {post.viewCount?.toLocaleString() || 0}
                </span>
                {post.commentCount !== undefined && post.commentCount > 0 && (
                  <span className="flex items-center gap-1">
                    <MessageCircle size={12} />
                    {post.commentCount}
                  </span>
                )}
              </div>
              {post.publishedAt && (
                <span>
                  {new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

function BlogSidebar({
  categories,
  activeCategory,
  onCategoryClick,
}: {
  categories: BlogCategory[];
  activeCategory: string;
  onCategoryClick: (slug: string) => void;
}) {
  return (
    <aside className="space-y-6">
      {/* Categories */}
      <div className="bg-card border border-border/60 rounded-2xl p-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-foreground mb-4">
          Danh mục
        </h3>
        <div className="space-y-1.5">
          <button
            onClick={() => onCategoryClick("")}
            className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 ${
              !activeCategory
                ? "bg-primary text-white font-medium"
                : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
            }`}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryClick(cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all duration-200 flex items-center justify-between ${
                activeCategory === cat.slug
                  ? "bg-primary text-white font-medium"
                  : "hover:bg-accent/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{cat.name}</span>
              {cat._count && (
                <span
                  className={`text-xs ${activeCategory === cat.slug ? "text-white/70" : "text-muted-foreground/50"}`}
                >
                  {cat._count.posts}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}

function BlogPagination({
  pagination,
  onPageChange,
}: {
  pagination: BlogPagination;
  onPageChange: (page: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page <= 1}
        className="p-2 rounded-xl bg-muted/40 border border-muted/50 disabled:opacity-30 hover:bg-accent/50 transition-colors"
      >
        <ChevronLeft size={18} />
      </button>

      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
        .filter(
          (p) =>
            p === 1 ||
            p === pagination.totalPages ||
            Math.abs(p - pagination.page) <= 2,
        )
        .map((p, idx, arr) => (
          <span key={p}>
            {idx > 0 && arr[idx - 1] !== p - 1 && (
              <span className="px-1 text-muted-foreground">•••</span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={`min-w-9 h-9 rounded-xl text-sm font-medium transition-all duration-200 ${
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
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page >= pagination.totalPages}
        className="p-2 rounded-xl bg-muted/40 border border-muted/50 disabled:opacity-30 hover:bg-accent/50 transition-colors"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

// ==================== Main Page ====================

function BlogListingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [pagination, setPagination] = useState<BlogPagination>({
    page: 1,
    pageSize: 9,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [postsData, categoriesData] = await Promise.all([
        getPosts({
          page: currentPage,
          pageSize: 9,
          categorySlug: currentCategory || undefined,
          search: currentSearch || undefined,
        }),
        getCategories(),
      ]);
      setPosts(postsData.items);
      setPagination(postsData.pagination);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Error fetching blog data:", err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, currentCategory, currentSearch]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    getFeaturedPosts(3)
      .then(setFeaturedPosts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setSearchQuery(currentSearch);
  }, [currentSearch]);

  const updateParams = (params: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    router.push(`/blog?${sp.toString()}`, { scroll: false });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: searchQuery, page: "", category: "" });
  };

  const handleCategoryClick = (slug: string) => {
    updateParams({ category: slug, page: "", search: "" });
    setSearchQuery("");
  };

  const handlePageChange = (page: number) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div>
      {/* Hero with featured post */}
      {!currentCategory && !currentSearch && currentPage === 1 && (
        <BlogHero featuredPosts={featuredPosts} />
      )}

      {/* Main content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-24">
              <BlogSidebar
                categories={categories}
                activeCategory={currentCategory}
                onCategoryClick={handleCategoryClick}
              />
            </div>
          </div>

          {/* Posts grid */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            {/* Search bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="relative">
                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-card border border-border/60 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>
            </form>

            {/* Active filters */}
            {(currentCategory || currentSearch) && (
              <div className="flex items-center gap-2 mb-6 flex-wrap">
                {currentCategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-muted/60 text-sm">
                    Danh mục:{" "}
                    <strong>
                      {categories.find((c) => c.slug === currentCategory)
                        ?.name || currentCategory}
                    </strong>
                    <button
                      onClick={() => handleCategoryClick("")}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {currentSearch && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-muted/60 text-sm">
                    Tìm: <strong>{currentSearch}</strong>
                    <button
                      onClick={() => updateParams({ search: "", page: "" })}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-card border border-border/60 rounded-2xl overflow-hidden animate-pulse"
                  >
                    <div className="h-52 bg-muted/30" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-muted/30 rounded w-3/4" />
                      <div className="h-3 bg-muted/20 rounded w-full" />
                      <div className="h-3 bg-muted/20 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Posts grid */}
            {!loading && posts.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {posts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} />
                ))}
              </motion.div>
            )}

            {/* Empty state */}
            {!loading && posts.length === 0 && (
              <div className="text-center py-20 bg-card border border-border/60 rounded-2xl">
                <Search
                  size={48}
                  className="mx-auto mb-4 text-muted-foreground/30"
                />
                <p className="text-lg font-medium text-muted-foreground">
                  Không tìm thấy bài viết nào
                </p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  Thử thay đổi từ khóa hoặc danh mục khác
                </p>
              </div>
            )}

            {/* Pagination */}
            {!loading && (
              <BlogPagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default function BlogListingPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <BlogListingPage />
    </Suspense>
  );
}
