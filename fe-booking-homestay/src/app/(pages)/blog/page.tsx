"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/_components/ui/popover";
import {
  getCategories,
  getFeaturedPosts,
  getPosts,
  type BlogCategory,
  type BlogPagination,
  type BlogPost,
} from "@/services/blogApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  Loader2,
  MessageCircle,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

// ==================== Animation Variants ====================

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
} as const;

const cardReveal = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 18 },
  },
} as const;

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

// ==================== Hero Section ====================
function BlogHero({ featuredPosts }: { featuredPosts: BlogPost[] }) {
  const mainPost = featuredPosts[0];
  if (!mainPost) return null;

  return (
    <section className="relative w-full overflow-hidden">
      <div className="relative h-105 sm:h-120 md:h-135 lg:h-150">
        {mainPost.thumbnailUrl ? (
          <Image
            src={mainPost.thumbnailUrl}
            alt={mainPost.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-linear-to-br from-primary/20 via-indigo-500/15 to-purple-600/20" />
        )}

        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-linear-to-r from-black/30 to-transparent" />

        <div className="absolute inset-0 max-w-7xl mx-auto z-10 pointer-events-none">
          <div className="absolute top-24 sm:top-28 left-6 lg:left-8 flex items-center gap-2 select-none pointer-events-auto">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-extrabold bg-primary text-white shadow-lg shadow-primary/30 tracking-wider uppercase backdrop-blur-sm">
              <Sparkles size={11} className="animate-pulse" />
              Nổi bật
            </span>
            <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/15 text-white border border-white/20 backdrop-blur-md tracking-wide uppercase">
              {mainPost.category?.name}
            </span>
          </div>

          <div className="absolute bottom-0 left-6 right-6 lg:left-8 lg:right-8 pb-6 sm:pb-8 md:pb-12 lg:pb-16 pointer-events-auto">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-3 sm:space-y-4"
              >
                <div className="flex items-center gap-3 text-white/80 text-xs sm:text-sm">
                  {mainPost.author && (
                    <div className="flex items-center gap-2">
                      {mainPost.author.avatar ? (
                        <Image
                          src={mainPost.author.avatar}
                          alt=""
                          width={28}
                          height={28}
                          className="rounded-full object-cover h-7 w-7 ring-2 ring-white/30"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white ring-2 ring-white/30">
                          {mainPost.author.firstName?.[0]}
                        </div>
                      )}
                      <span className="font-semibold text-white">
                        {mainPost.author.firstName} {mainPost.author.lastName}
                      </span>
                    </div>
                  )}
                  <span className="text-white/50">•</span>
                  <span>
                    {new Date(
                      mainPost.publishedAt || Date.now(),
                    ).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight line-clamp-3 drop-shadow-lg">
                  {mainPost.title}
                </h1>

                <p className="text-white/75 text-sm sm:text-base leading-relaxed line-clamp-2 max-w-2xl">
                  {mainPost.excerpt}
                </p>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-4 text-white/60 text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} />
                      {mainPost.readingTime || 5} phút đọc
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye size={13} />
                      {mainPost.viewCount?.toLocaleString() || 0} lượt xem
                    </span>
                  </div>

                  <Link
                    href={`/blog/${mainPost.slug}`}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs sm:text-sm font-bold backdrop-blur-md transition-all duration-300 hover:scale-[1.03] active:scale-95 shadow-lg"
                  >
                    Đọc bài viết
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ==================== Category Tabs ====================
function CategoryTabs({
  categories,
  activeCategory,
  onCategoryClick,
  isSticky = false,
}: {
  categories: BlogCategory[];
  activeCategory: string;
  onCategoryClick: (slug: string) => void;
  isSticky?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative select-none">
      <div
        className={`absolute left-0 top-0 bottom-0 w-6 bg-linear-to-r ${isSticky ? "from-background" : "from-background/10"} to-transparent pointer-events-none z-10 sm:hidden`}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-6 bg-linear-to-l ${isSticky ? "from-background" : "from-background/10"} to-transparent pointer-events-none z-10 sm:hidden`}
      />

      <div
        ref={scrollRef}
        className="flex gap-1 sm:gap-1.5 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap sm:overflow-visible"
      >
        <button
          onClick={() => onCategoryClick("")}
          className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer active:scale-95 border ${
            !activeCategory
              ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
              : isSticky
                ? "bg-card border-border/85 text-foreground/80 hover:bg-primary/8 hover:text-primary hover:border-primary/40 shadow-xs"
                : "bg-transparent border-border/60 text-muted-foreground hover:bg-primary/8 hover:text-primary hover:border-primary/30"
          }`}
        >
          Tất cả
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onCategoryClick(cat.slug)}
            className={`relative px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-300 cursor-pointer active:scale-95 flex items-center gap-1.5 border ${
              activeCategory === cat.slug
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : isSticky
                  ? "bg-card border-border/85 text-foreground/80 hover:bg-primary/8 hover:text-primary hover:border-primary/40 shadow-xs"
                  : "bg-transparent border-border/60 text-muted-foreground hover:bg-primary/8 hover:text-primary hover:border-primary/30"
            }`}
          >
            <span>{cat.name}</span>
            {cat._count && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeCategory === cat.slug
                    ? "bg-white/20 text-white"
                    : isSticky
                      ? "bg-primary/10 text-primary"
                      : "bg-primary/8 text-primary/60"
                }`}
              >
                {cat._count.posts}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ==================== Featured Card (First Card — Large) ====================
function FeaturedBlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.div variants={cardReveal} className="col-span-full">
      <Link href={`/blog/${post.slug}`}>
        <article className="relative bg-card border border-border/40 rounded-2xl sm:rounded-3xl overflow-hidden group cursor-pointer hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 shadow-sm">
          <div className="grid lg:grid-cols-5 gap-0">
            <div className="relative h-56 sm:h-64 md:h-80 lg:h-96 lg:col-span-3 overflow-hidden">
              {post.thumbnailUrl ? (
                <Image
                  src={post.thumbnailUrl}
                  alt={post.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary/10 to-purple-500/10 flex items-center justify-center">
                  <Sparkles size={48} className="text-primary/25" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2 select-none">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/80 dark:bg-card/85 text-primary border border-white/50 dark:border-border/50 backdrop-blur-md tracking-wide uppercase shadow-sm">
                  {post.category?.name}
                </span>
                {post.isFeatured && (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-400/90 text-amber-900 tracking-wide uppercase shadow-sm flex items-center gap-1">
                    <Sparkles size={10} />
                    Hot
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col justify-between min-w-0">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {post.author && (
                    <div className="flex items-center gap-1.5">
                      {post.author.avatar ? (
                        <Image
                          src={post.author.avatar}
                          alt=""
                          width={20}
                          height={20}
                          className="rounded-full object-cover h-5 w-5"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[9px] font-bold text-primary">
                          {post.author.firstName?.[0]}
                        </div>
                      )}
                      <span className="font-semibold text-foreground/80">
                        {post.author.firstName}
                      </span>
                    </div>
                  )}
                  <span className="text-muted-foreground/40">•</span>
                  <span>
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "long",
                        })
                      : ""}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 leading-snug line-clamp-3">
                  {post.title}
                </h2>

                <p className="text-xs sm:text-sm text-muted-foreground/80 leading-relaxed line-clamp-3 hidden sm:block">
                  {post.excerpt}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/30 mt-4 sm:mt-6">
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock size={12} className="text-muted-foreground/70" />
                    {post.readingTime || 5} phút
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} className="text-muted-foreground/70" />
                    {post.viewCount?.toLocaleString() || 0}
                  </span>
                  {post.commentCount !== undefined && post.commentCount > 0 && (
                    <span className="flex items-center gap-1">
                      <MessageCircle
                        size={12}
                        className="text-muted-foreground/70"
                      />
                      {post.commentCount}
                    </span>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all duration-300">
                  Đọc thêm
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

// ==================== Standard Blog Card ====================
function BlogCard({ post }: { post: BlogPost }) {
  return (
    <motion.div variants={cardReveal}>
      <Link href={`/blog/${post.slug}`}>
        <article className="bg-card border border-border/40 rounded-2xl overflow-hidden group cursor-pointer h-full flex flex-col hover:shadow-xl hover:shadow-primary/3 hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 shadow-sm">
          <div className="relative aspect-3/2 w-full overflow-hidden bg-muted/30">
            {post.thumbnailUrl ? (
              <Image
                src={post.thumbnailUrl}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="w-full h-full bg-linear-to-br from-primary/8 to-purple-500/8 flex items-center justify-center">
                <Sparkles size={28} className="text-primary/20" />
              </div>
            )}
            <div className="absolute top-3 left-3 select-none">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-white/80 dark:bg-card/85 text-primary backdrop-blur-md tracking-wider uppercase shadow-sm border border-white/40 dark:border-border/50">
                {post.category?.name}
              </span>
            </div>
            {post.isFeatured && (
              <div className="absolute top-3 right-3 bg-amber-400/90 p-1.5 rounded-full shadow-sm">
                <Sparkles size={11} className="text-amber-800" />
              </div>
            )}
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
            <div className="space-y-2 mb-3">
              <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2 leading-snug">
                {post.title}
              </h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground/75 line-clamp-2 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-muted-foreground pt-3 border-t border-border/30 mt-auto">
              <div className="flex items-center gap-1.5 min-w-0">
                {post.author ? (
                  <>
                    {post.author.avatar ? (
                      <Image
                        src={post.author.avatar}
                        alt=""
                        width={16}
                        height={16}
                        className="rounded-full object-cover h-4 w-4 shrink-0"
                      />
                    ) : (
                      <div className="w-4 h-4 rounded-full bg-primary/20 shrink-0" />
                    )}
                    <span className="font-semibold text-foreground/80 truncate">
                      {post.author.firstName}
                    </span>
                  </>
                ) : (
                  <span className="font-semibold text-foreground/75">
                    4Stay
                  </span>
                )}
                <span className="text-muted-foreground/30 shrink-0">•</span>
                <span className="shrink-0">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      })
                    : ""}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0 font-medium">
                <span className="flex items-center gap-0.5">
                  <Clock size={11} className="text-muted-foreground/60" />
                  {post.readingTime || 5}m
                </span>
                <span className="flex items-center gap-0.5">
                  <Eye size={11} className="text-muted-foreground/60" />
                  {post.viewCount?.toLocaleString() || 0}
                </span>
                {post.commentCount !== undefined && post.commentCount > 0 && (
                  <span className="flex items-center gap-0.5">
                    <MessageCircle
                      size={11}
                      className="text-muted-foreground/60"
                    />
                    {post.commentCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}

// ==================== Pagination ====================
function BlogPaginationComponent({
  pagination,
  onPageChange,
}: {
  pagination: BlogPagination;
  onPageChange: (page: number) => void;
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-12 select-none">
      <button
        onClick={() => onPageChange(pagination.page - 1)}
        disabled={pagination.page <= 1}
        className="p-2.5 rounded-xl bg-card border border-border/50 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-muted hover:text-foreground text-muted-foreground transition-all duration-200 cursor-pointer active:scale-95 shadow-xs"
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
              <span className="px-1.5 text-muted-foreground/40 text-xs select-none font-bold">
                •••
              </span>
            )}
            <button
              onClick={() => onPageChange(p)}
              className={`min-w-9 h-9 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                p === pagination.page
                  ? "bg-foreground text-background shadow-md font-extrabold"
                  : "bg-card border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground shadow-xs"
              }`}
            >
              {p}
            </button>
          </span>
        ))}

      <button
        onClick={() => onPageChange(pagination.page + 1)}
        disabled={pagination.page >= pagination.totalPages}
        className="p-2.5 rounded-xl bg-card border border-border/50 disabled:opacity-20 disabled:cursor-not-allowed hover:bg-muted hover:text-foreground text-muted-foreground transition-all duration-200 cursor-pointer active:scale-95 shadow-xs"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ==================== Loading Skeleton ====================
function BlogSkeleton() {
  return (
    <div className="space-y-8">
      {/* Featured card skeleton */}
      <div className="bg-card border border-border/40 rounded-2xl sm:rounded-3xl overflow-hidden animate-pulse shadow-sm">
        <div className="grid md:grid-cols-5">
          <div className="h-56 sm:h-64 md:h-80 md:col-span-3 bg-muted/30" />
          <div className="md:col-span-2 p-6 md:p-8 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-muted/40" />
              <div className="h-3 bg-muted/40 rounded w-20" />
              <div className="h-3 bg-muted/30 rounded w-16" />
            </div>
            <div className="h-6 bg-muted/40 rounded w-full" />
            <div className="h-6 bg-muted/35 rounded w-3/4" />
            <div className="h-4 bg-muted/25 rounded w-full" />
            <div className="h-4 bg-muted/20 rounded w-2/3" />
            <div className="pt-4 border-t border-border/30 flex justify-between">
              <div className="h-3 bg-muted/30 rounded w-1/3" />
              <div className="h-3 bg-muted/30 rounded w-1/5" />
            </div>
          </div>
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-card border border-border/40 rounded-2xl overflow-hidden animate-pulse shadow-sm"
          >
            <div className="aspect-3/2 bg-muted/25" />
            <div className="p-4 sm:p-5 space-y-3">
              <div className="h-4 bg-muted/40 rounded w-5/6" />
              <div className="h-4 bg-muted/30 rounded w-full" />
              <div className="h-3 bg-muted/20 rounded w-2/3" />
              <div className="pt-3 border-t border-border/30 flex justify-between">
                <div className="h-3 bg-muted/25 rounded w-1/3" />
                <div className="h-3 bg-muted/25 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
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
  const [isFetching, setIsFetching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchSticky, setIsSearchSticky] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [isPending, startTransition] = useTransition();
  const searchSectionRef = useRef<HTMLDivElement>(null);

  const currentPage = Number(searchParams.get("page")) || 1;
  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("search") || "";
  const currentSortBy = searchParams.get("sortBy") || "publishedAt";

  const sortOptions = [
    { label: "Mới nhất", value: "publishedAt" },
    { label: "Xem nhiều nhất", value: "viewCount" },
    { label: "Bài viết nổi bật", value: "isFeatured" },
  ];

  const fetchData = useCallback(async () => {
    if (posts.length === 0) {
      setLoading(true);
    }
    setIsFetching(true);
    try {
      const [postsData, categoriesData] = await Promise.all([
        getPosts({
          page: currentPage,
          pageSize: 3,
          categorySlug: currentCategory || undefined,
          search: currentSearch || undefined,
          sortBy: currentSortBy || undefined,
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
      setIsFetching(false);
    }
  }, [
    currentPage,
    currentCategory,
    currentSearch,
    currentSortBy,
    posts.length,
  ]);

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

  // Debounce search query changes
  useEffect(() => {
    if (searchQuery === currentSearch) return;

    const timer = setTimeout(() => {
      updateParams({ search: searchQuery, page: "", category: "" });
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, currentSearch]);

  // Sticky search observer
  useEffect(() => {
    const el = searchSectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsSearchSticky(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "-80px 0px 0px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const updateParams = (params: Record<string, string>) => {
    const sp = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    startTransition(() => {
      router.push(`/blog?${sp.toString()}`, { scroll: false });
    });
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

  const handleSortSelect = (sortByValue: string) => {
    updateParams({ sortBy: sortByValue, page: "" });
  };

  const isFiltering = !!currentCategory || !!currentSearch || currentPage > 1;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero — only on first page with no filters */}
      {!isFiltering && <BlogHero featuredPosts={featuredPosts} />}

      {/* Page intro heading when no hero */}
      {isFiltering && (
        <section className="pt-4 pb-2 max-w-6xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Link
              href="/blog"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Trang Blog
            </Link>
          </motion.div>
        </section>
      )}

      {/* Sentinel for sticky detection */}
      <div ref={searchSectionRef} className="h-0" />

      {/* Search + Categories Section */}
      <section
        className={`sticky top-18 z-30 transition-all duration-300 ${
          isSearchSticky
            ? "bg-background/95 dark:bg-background/98 backdrop-blur-md border-b border-primary/10 shadow-md shadow-primary/5"
            : "bg-transparent"
        }`}
      >
        <div
          className={`max-w-6xl mx-auto px-4 sm:px-6 transition-all duration-300 ${
            isSearchSticky
              ? "py-3 sm:py-3.5 space-y-2.5 sm:space-y-3"
              : "py-4 sm:py-5 space-y-3 sm:space-y-4"
          }`}
        >
          {/* Search bar & Sort bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative group">
                {isPending || isFetching ? (
                  <Loader2
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-primary animate-spin"
                  />
                ) : (
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60 group-focus-within:text-primary transition-colors duration-300"
                  />
                )}
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm kinh nghiệm du lịch, homestay..."
                  className="w-full pl-11 pr-10 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary/15 focus:border-primary/50 transition-all duration-300 shadow-xs placeholder:text-muted-foreground/45 text-foreground"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      updateParams({ search: "", page: "" });
                    }}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground cursor-pointer p-1 rounded-full hover:bg-muted/50 transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            </form>

            {/* Sort Selector Popover */}
            <div className="relative shrink-0 flex justify-end">
              <Popover open={sortOpen} onOpenChange={setSortOpen}>
                <PopoverTrigger asChild>
                  <button
                    className={`flex items-center justify-between gap-2 px-4 py-3 rounded-xl bg-card border border-border/50 hover:border-primary/40 text-sm focus:outline-none transition-all duration-300 shadow-xs text-foreground cursor-pointer w-full sm:w-52 ${
                      sortOpen || currentSortBy
                        ? "border-primary/50 text-primary"
                        : ""
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ArrowUpDown
                        size={16}
                        className={
                          currentSortBy
                            ? "text-primary"
                            : "text-muted-foreground/70"
                        }
                      />
                      <span className="text-xs sm:text-sm truncate font-medium">
                        {sortOptions.find((o) => o.value === currentSortBy)
                          ?.label || "Sắp xếp theo"}
                      </span>
                    </span>
                    <ChevronDown
                      size={16}
                      className={`transition-transform duration-300 text-muted-foreground/70 ${sortOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-56 p-2 border border-border/50 rounded-2xl shadow-xl z-50 bg-white/90 dark:bg-black/90 backdrop-blur-2xl"
                  align="end"
                  sideOffset={4}
                >
                  <div className="space-y-1">
                    {sortOptions.map((option) => {
                      const isSelected = currentSortBy === option.value;
                      return (
                        <button
                          key={option.value}
                          onClick={() => {
                            handleSortSelect(option.value);
                            setSortOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-sm transition-all duration-300 hover:bg-primary/5 cursor-pointer ${
                            isSelected
                              ? "text-primary font-bold bg-primary/8"
                              : "text-foreground/80"
                          }`}
                        >
                          <span className="truncate">{option.label}</span>
                          {isSelected && (
                            <Check size={14} className="text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Category tabs */}
          <CategoryTabs
            categories={categories}
            activeCategory={currentCategory}
            onCategoryClick={handleCategoryClick}
            isSticky={isSearchSticky}
          />

          {/* Active filter chips */}
          <AnimatePresence>
            {(currentCategory || currentSearch) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 flex-wrap overflow-hidden"
              >
                {currentCategory && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-xs font-semibold text-primary">
                    Danh mục:{" "}
                    <span className="text-foreground font-bold">
                      {categories.find((c) => c.slug === currentCategory)
                        ?.name || currentCategory}
                    </span>
                    <button
                      onClick={() => handleCategoryClick("")}
                      className="ml-0.5 text-muted-foreground/50 hover:text-foreground cursor-pointer p-0.5 rounded-full hover:bg-muted/50 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {currentSearch && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/15 text-xs font-semibold text-primary">
                    Tìm kiếm:{" "}
                    <span className="text-foreground font-bold">
                      &ldquo;{currentSearch}&rdquo;
                    </span>
                    <button
                      onClick={() => updateParams({ search: "", page: "" })}
                      className="ml-0.5 text-muted-foreground/50 hover:text-foreground cursor-pointer p-0.5 rounded-full hover:bg-muted/50 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Posts Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 pt-2">
        {/* Loading skeleton */}
        {loading && posts.length === 0 && <BlogSkeleton />}

        {/* Posts grid with magazine layout */}
        {posts.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            key={`${currentCategory}-${currentSearch}-${currentPage}`}
            className={`transition-opacity duration-300 ${
              isPending || isFetching
                ? "opacity-40 pointer-events-none"
                : "opacity-100"
            }`}
          >
            {/* First post as featured card (only on first page, no search) */}
            {currentPage === 1 && !currentSearch && (
              <div className="mb-6 sm:mb-8">
                <FeaturedBlogCard post={posts[0]} />
              </div>
            )}

            {/* Remaining posts grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {(currentPage === 1 && !currentSearch
                ? posts.slice(1)
                : posts
              ).map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !isFetching && posts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20 bg-card border border-border/40 rounded-2xl sm:rounded-3xl shadow-sm"
          >
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-primary/8 flex items-center justify-center">
              <Search size={28} className="text-primary/35" />
            </div>
            <p className="text-lg font-bold text-foreground">
              Không tìm thấy bài viết nào
            </p>
            <p className="text-sm text-muted-foreground/70 mt-2 max-w-sm mx-auto leading-relaxed">
              Thử thay đổi từ khóa hoặc chọn một danh mục khác để khám phá nội
              dung hữu ích.
            </p>
            <button
              onClick={() => {
                handleCategoryClick("");
                setSearchQuery("");
                updateParams({ search: "", category: "", page: "" });
              }}
              className="mt-6 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all cursor-pointer active:scale-95 shadow-md shadow-primary/15"
            >
              Xem tất cả bài viết
            </button>
          </motion.div>
        )}

        {/* Pagination */}
        {posts.length > 0 && (
          <div
            className={
              isPending || isFetching ? "opacity-40 pointer-events-none" : ""
            }
          >
            <BlogPaginationComponent
              pagination={pagination}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </section>
    </div>
  );
}

export default function BlogListingPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
        </div>
      }
    >
      <BlogListingPage />
    </Suspense>
  );
}
