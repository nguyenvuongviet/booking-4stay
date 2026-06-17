"use client";

import { useAuth } from "@/context/auth-context";
import {
  formatDiscountBadge,
  formatMinSpend,
} from "@/lib/utils/promotionUtils";
import { incrementView, type BlogPost } from "@/services/blogApi";
import {
  collect_coupon,
  get_blog_coupons,
  get_voucher_wallet,
} from "@/services/promotionApi";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUp,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  List,
  Loader2,
  MessageCircle,
  Share2,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { CommentSection } from "../../_components/CommentSection";
import { RelatedRooms } from "../../_components/RelatedRooms";

// ==================== Table of Contents ====================

function TableOfContents({
  headings,
  activeId,
  onHeadingClick,
}: {
  headings: { id: string; text: string; level: number }[];
  activeId: string;
  onHeadingClick?: (e: React.MouseEvent<HTMLAnchorElement>, id: string) => void;
}) {
  if (headings.length < 2) return null;

  return (
    <nav className="bg-card border border-border/50 hover:border-primary/10 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 space-y-3 relative overflow-hidden">
      <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-3 flex items-center gap-1.5 select-none">
        <span className="w-1 h-3.5 bg-primary rounded-full animate-pulse" />
        Mục lục bài viết
      </h4>
      <div className="relative pl-3 border-l border-border/30 space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto beautiful-scrollbar">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          return (
            <a
              key={h.id}
              href={`#${h.id}`}
              onClick={(e) => {
                if (onHeadingClick) {
                  onHeadingClick(e, h.id);
                }
              }}
              className={`block text-xs sm:text-sm transition-all duration-300 border-l-2 -ml-3.25 ${
                h.level === 3 ? "pl-7" : "pl-3.5"
              } ${
                isActive
                  ? "border-primary text-primary font-extrabold bg-primary/5 rounded-r-xl py-1.5 pr-2 shadow-2xs"
                  : "border-transparent text-muted-foreground/80 hover:text-primary hover:pl-4.5 py-1"
              }`}
            >
              {h.text}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

// ==================== Share Buttons ====================

function ShareButtons({ title }: { title: string }) {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const shareOptions = [
    {
      name: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      color:
        "hover:bg-blue-500/10 hover:text-blue-600 hover:border-blue-500/30",
    },
    {
      name: "Twitter",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      color: "hover:bg-sky-500/10 hover:text-sky-600 hover:border-sky-500/30",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Đã sao chép liên kết!");
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs font-semibold text-muted-foreground/80 mr-1 flex items-center gap-1">
        <Share2 size={13} />
        Chia sẻ:
      </span>
      {shareOptions.map((opt) => (
        <a
          key={opt.name}
          href={opt.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-3.5 py-1.5 rounded-full bg-card border border-border/80 text-xs font-semibold text-foreground/80 transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xs ${opt.color}`}
        >
          {opt.name}
        </a>
      ))}
      <button
        onClick={handleCopy}
        className={`px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-2xs cursor-pointer ${
          copied
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
            : "bg-card border-border/80 text-foreground/80 hover:bg-primary/8 hover:text-primary hover:border-primary/30"
        }`}
      >
        {copied ? (
          <>
            <Check size={12} className="inline mr-1" />
            Đã copy!
          </>
        ) : (
          <>
            <Copy size={12} className="inline mr-1" />
            Copy Link
          </>
        )}
      </button>
    </div>
  );
}

// ==================== Blog Coupons Widget ====================

interface Promotion {
  id: number;
  code: string;
  name: string;
  discountType: string;
  discountValue: number;
  maxDiscount?: number;
  minOrderValue?: number;
  endDate: string;
}

function BlogCouponsWidget({ postId }: { postId: number }) {
  const { user, openSignIn } = useAuth();
  const [coupons, setCoupons] = useState<Promotion[]>([]);
  const [collectedIds, setCollectedIds] = useState<number[]>([]);
  const [collectingIds, setCollectingIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadCoupons = async () => {
      try {
        const data = await get_blog_coupons(postId);
        if (active) setCoupons(data);
      } catch (err) {
        console.error("Error loading blog coupons:", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCoupons();
    return () => {
      active = false;
    };
  }, [postId]);

  useEffect(() => {
    if (user) {
      get_voucher_wallet("AVAILABLE")
        .then((data) => {
          if (Array.isArray(data)) {
            setCollectedIds(
              data.map((v: any) => v.promotion?.id).filter(Boolean),
            );
          }
        })
        .catch((err) => console.error("Error loading wallet:", err));
    } else {
      setCollectedIds([]);
    }
  }, [user]);

  const handleCollect = async (promo: Promotion) => {
    if (!user) {
      openSignIn();
      return;
    }
    if (collectedIds.includes(promo.id)) {
      toast.error("Mã này đã được lưu vào ví của bạn!");
      return;
    }
    setCollectingIds((prev) => [...prev, promo.id]);
    try {
      await collect_coupon(promo.id);
      setCollectedIds((prev) => [...prev, promo.id]);
      toast.success(`Đã lưu mã ${promo.code} vào ví!`);
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Không thể lưu mã này";
      toast.error(errMsg);
    } finally {
      setCollectingIds((prev) => prev.filter((id) => id !== promo.id));
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Đã sao chép mã: ${code}`);
  };

  if (loading) {
    return (
      <div className="mt-8 p-6 bg-card border border-border/60 rounded-2xl animate-pulse space-y-4">
        <div className="h-6 bg-muted/40 rounded w-1/3" />
        <div className="grid md:grid-cols-2 gap-4">
          <div className="h-24 bg-muted/30 rounded-xl" />
          <div className="h-24 bg-muted/30 rounded-xl" />
        </div>
      </div>
    );
  }

  if (coupons.length === 0) return null;

  return (
    <div className="mt-8 border-t border-border/50 pt-8">
      <h3 className="text-xl font-bold tracking-tight mb-5 flex items-center gap-2 text-foreground">
        <Sparkles size={20} className="text-amber-500 animate-pulse" />
        Ưu đãi dành riêng cho bạn đọc
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.map((coupon) => {
          const isCollected = collectedIds.includes(coupon.id);
          const isCollecting = collectingIds.includes(coupon.id);

          return (
            <div
              key={coupon.id}
              className="relative flex items-stretch border border-border/40 hover:border-primary/30 hover:bg-primary/5 hover:shadow-md shadow-2xs rounded-xl bg-card active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-300 overflow-hidden group w-full max-w-[320px] sm:max-w-none mx-auto"
            >
              {/* Left Stub (Discount highlight) */}
              <div className="relative w-18 bg-linear-to-br from-primary/8 to-primary/4 flex flex-col justify-center items-center text-center p-1.5 border-r border-dashed border-border/80 shrink-0 select-none transition-colors duration-300 group-hover:bg-primary/10">
                {/* Top half-circle notch */}
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-background border border-border/40 group-hover:bg-primary/5 transition-colors duration-200 z-10" />
                {/* Bottom half-circle notch */}
                <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full bg-background border border-border/40 group-hover:bg-primary/5 transition-colors duration-200 z-10" />

                <span className="text-[8px] font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider">
                  GIẢM
                </span>
                <span className="text-sm sm:text-base font-black bg-linear-to-r from-primary to-orange-500 bg-clip-text text-transparent leading-none mt-1">
                  {formatDiscountBadge(coupon)}
                </span>
              </div>

              {/* Details Section */}
              <div className="flex-1 p-2 flex flex-col justify-between min-w-0">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="px-1 py-px rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[7.5px] font-bold uppercase tracking-wider shrink-0 border border-emerald-500/20">
                      Blog Only
                    </span>
                    <button
                      onClick={() => handleCopyCode(coupon.code)}
                      className="text-[7.5px] font-mono font-bold text-primary hover:bg-primary/10 border border-primary/20 px-1 py-px rounded bg-primary/5 shrink-0 cursor-pointer flex items-center gap-0.5 transition-all duration-200 active:scale-95"
                      title="Click để sao chép mã"
                    >
                      <Copy size={7} />
                      {coupon.code}
                    </button>
                  </div>
                  <h4 className="font-bold text-[10px] text-foreground line-clamp-1 group-hover:text-primary transition-colors leading-tight">
                    {coupon.name}
                  </h4>
                  <p className="text-[8px] text-muted-foreground/80 font-medium">
                    {formatMinSpend(coupon)}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-1.5 mt-1.5 pt-1 border-t border-border/20">
                  <span className="text-[7.5px] text-muted-foreground">
                    HSD: {new Date(coupon.endDate).toLocaleDateString("vi-VN")}
                  </span>

                  <button
                    onClick={() => handleCollect(coupon)}
                    disabled={isCollected || isCollecting}
                    className={`inline-flex items-center justify-center gap-0.5 px-2 py-0.75 rounded-md text-[8px] font-bold transition-all duration-300 cursor-pointer ${
                      isCollected
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 cursor-default"
                        : "bg-primary text-white hover:bg-[#4f46e5] hover:scale-102 active:scale-98 shadow-2xs"
                    }`}
                  >
                    {isCollecting ? (
                      <Loader2 size={7} className="animate-spin" />
                    ) : isCollected ? (
                      <>
                        <Check size={7} />
                        Đã lưu
                      </>
                    ) : (
                      <>
                        <Download size={7} />
                        Lưu ví
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
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
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobileTocOpen, setIsMobileTocOpen] = useState(false);
  const [activeId, setActiveId] = useState("");
  const articleRef = useRef<HTMLDivElement>(null);
  const isManualScrolling = useRef(false);
  const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Scroll related posts container
  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkRelatedScroll = () => {
    if (relatedScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = relatedScrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  useEffect(() => {
    const el = relatedScrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkRelatedScroll, { passive: true });
      checkRelatedScroll();
      window.addEventListener("resize", checkRelatedScroll);
    }
    return () => {
      if (el) {
        el.removeEventListener("scroll", checkRelatedScroll);
      }
      window.removeEventListener("resize", checkRelatedScroll);
    };
  }, [relatedPosts]);

  const handleRelatedScroll = (direction: "left" | "right") => {
    if (relatedScrollRef.current) {
      const { clientWidth } = relatedScrollRef.current;
      const scrollAmount =
        direction === "left" ? -clientWidth * 0.75 : clientWidth * 0.75;
      relatedScrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Increment view count (client-side only)
  useEffect(() => {
    incrementView(post.slug).catch(() => {});
  }, [post.slug]);

  // Scroll listener for scroll-to-top & progress bar
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Parse headings from HTML using regex for SSR safety and consistency
  const headings = useMemo(() => {
    if (!post.content) return [];
    const items: { id: string; text: string; level: number }[] = [];

    const headingRegex = /<(h2|h3)\b[^>]*>([\s\S]*?)<\/h[23]>/gi;
    let match;
    let index = 0;

    while ((match = headingRegex.exec(post.content)) !== null) {
      const level = match[1].toLowerCase() === "h2" ? 2 : 3;
      const text = match[2]
        .replace(/<\/?[^>]+(>|$)/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
      items.push({
        id: `heading-${index}`,
        text: text,
        level: level,
      });
      index++;
    }

    return items;
  }, [post.content]);

  // Process post content to inject IDs and classes on h2/h3 tags
  const processedContent = useMemo(() => {
    if (!post.content) return "";
    let totalCount = 0;

    return post.content.replace(
      /<(h2|h3)\b([^>]*)>/gi,
      (match: string, tag: string, attrs: string) => {
        const idAttr = `id="heading-${totalCount}"`;
        totalCount++;

        if (/class=["']/i.test(attrs)) {
          attrs = attrs.replace(
            /class=(["'])(.*?)\1/i,
            (m: string, quote: string, cls: string) => {
              return `class=${quote}${cls} scroll-mt-24${quote}`;
            },
          );
        } else {
          attrs = `${attrs} class="scroll-mt-24"`;
        }

        return `<${tag} ${idAttr} ${attrs}>`;
      },
    );
  }, [post.content]);

  // Track active scroll heading (Next.js docs-like Scroll Spy)
  useEffect(() => {
    if (!articleRef.current) return;
    const domHeadings = articleRef.current.querySelectorAll("h2, h3");
    const headingElements = Array.from(domHeadings) as HTMLElement[];

    const handleScrollSpy = () => {
      if (isManualScrolling.current) return;

      const scrollPosition =
        window.scrollY + Math.min(window.innerHeight * 0.35, 300);
      let currentActive = "";

      for (const el of headingElements) {
        const elTop = el.getBoundingClientRect().top + window.scrollY;
        if (elTop <= scrollPosition) {
          currentActive = el.id;
        } else {
          break;
        }
      }

      if (currentActive) {
        setActiveId(currentActive);
      } else if (headingElements.length > 0) {
        setActiveId(headingElements[0].id);
      }
    };

    // Run spy on mount/content change
    handleScrollSpy();

    window.addEventListener("scroll", handleScrollSpy, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScrollSpy);
      if (manualScrollTimeoutRef.current) {
        clearTimeout(manualScrollTimeoutRef.current);
      }
    };
  }, [headings]);

  // Scroll active TOC item into view inside the TOC scroll container when activeId changes
  useEffect(() => {
    if (!activeId) return;
    const activeLink = document.querySelector(
      `a[href="#${activeId}"]`,
    ) as HTMLElement;
    const container = activeLink?.parentElement as HTMLElement;
    if (activeLink && container) {
      const linkTop = activeLink.offsetTop;
      const linkHeight = activeLink.offsetHeight;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;

      if (linkTop < containerScrollTop) {
        container.scrollTo({ top: linkTop - 8, behavior: "smooth" });
      } else if (linkTop + linkHeight > containerScrollTop + containerHeight) {
        container.scrollTo({
          top: linkTop + linkHeight - containerHeight + 8,
          behavior: "smooth",
        });
      }
    }
  }, [activeId]);

  const handleHeadingClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    e.preventDefault();

    // Disable scroll listener updates while smooth scrolling
    isManualScrolling.current = true;
    setActiveId(id);

    if (manualScrollTimeoutRef.current) {
      clearTimeout(manualScrollTimeoutRef.current);
    }

    const element = document.getElementById(id);
    if (element) {
      const offset = 96; // Offset for sticky header
      const elementPosition =
        element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      window.history.pushState(null, "", `#${id}`);

      // Re-enable scroll listener after scroll animation completes
      manualScrollTimeoutRef.current = setTimeout(() => {
        isManualScrolling.current = false;
      }, 800);
    } else {
      isManualScrolling.current = false;
    }
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 z-50 bg-muted/20">
        <div
          className="h-full bg-linear-to-r from-primary to-orange-500 transition-all duration-100 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb with Schema.org Microdata */}
        <nav
          aria-label="Breadcrumb"
          itemScope
          itemType="https://schema.org/BreadcrumbList"
          className="text-xs sm:text-sm text-muted-foreground/80 mb-8 flex items-center gap-2 flex-wrap"
        >
          <div
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="flex items-center gap-2"
          >
            <Link
              itemProp="item"
              href="/blog"
              className="hover:text-primary transition-colors font-semibold"
            >
              <span itemProp="name">Blog</span>
            </Link>
            <meta itemProp="position" content="1" />
          </div>

          <ChevronRight size={12} className="text-muted-foreground/45" />

          <div
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="flex items-center gap-2"
          >
            <Link
              itemProp="item"
              href={`/blog?category=${post.category?.slug}`}
              className="hover:text-primary transition-colors font-semibold"
            >
              <span itemProp="name">{post.category?.name}</span>
            </Link>
            <meta itemProp="position" content="2" />
          </div>

          <ChevronRight size={12} className="text-muted-foreground/45" />

          <div
            itemProp="itemListElement"
            itemScope
            itemType="https://schema.org/ListItem"
            className="truncate max-w-48 sm:max-w-64"
          >
            <span
              itemProp="name"
              className="text-foreground/90 font-extrabold truncate"
            >
              {post.title}
            </span>
            <meta itemProp="position" content="3" />
          </div>
        </nav>

        {/* Hero Header Layout */}
        <div className="space-y-6 mb-8 pt-2">
          {/* Metadata and Title */}
          <header className="space-y-4 text-left">
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/blog?category=${post.category?.slug}`}
                className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-primary/10 text-primary hover:bg-primary/20 transition-all duration-300 shadow-2xs"
              >
                {post.category?.name}
              </Link>
              {post.tags?.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/blog?tag=${tag.slug}`}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-primary/5 hover:bg-primary/10 border border-primary/10 hover:border-primary/20 text-primary/80 hover:text-primary transition-all duration-300 flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <Tag size={10} />
                  {tag.name}
                </Link>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-foreground">
              {post.title}
            </h1>

            {/* Author + meta - Left aligned */}
            <div className="flex items-center gap-x-4 gap-y-2.5 flex-wrap text-xs sm:text-sm text-muted-foreground/90 font-medium pt-3 border-t border-border/40">
              <div className="flex items-center gap-2">
                {post.author?.avatar ? (
                  <Image
                    src={post.author.avatar}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-full object-cover h-8 w-8 ring-2 ring-primary/10"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary ring-2 ring-primary/10">
                    {post.author?.firstName?.[0]}
                  </div>
                )}
                <span className="font-semibold text-foreground">
                  {post.author?.firstName} {post.author?.lastName}
                </span>
              </div>
              <span className="text-muted-foreground/30">•</span>
              <span className="flex items-center gap-1">
                <Calendar size={13} />
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString("vi-VN", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Chưa xuất bản"}
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {post.readingTime || 5} phút đọc
              </span>
              <span className="text-muted-foreground/30">•</span>
              <span className="flex items-center gap-1">
                <Eye size={13} />
                {post.viewCount?.toLocaleString()} lượt xem
              </span>
              {post.commentCount !== undefined && post.commentCount > 0 && (
                <>
                  <span className="text-muted-foreground/30">•</span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={13} />
                    {post.commentCount} bình luận
                  </span>
                </>
              )}
            </div>
          </header>
        </div>

        {/* Article and TOC Sidebar Grid (TOC is sticky to article height only) */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 mb-8">
          {/* Main article body */}
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <article className="bg-card border border-border/40 hover:border-primary/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-xs hover:shadow-md transition-all duration-300">
              {/* Article content */}
              <div
                ref={articleRef}
                className="prose prose-lg max-w-none
                  prose-headings:font-extrabold prose-headings:tracking-tight prose-headings:text-foreground
                  prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
                  prose-h3:text-xl prose-h3:mt-5 prose-h3:mb-2
                  prose-p:text-muted-foreground/90 prose-p:leading-relaxed prose-p:text-base prose-p:mb-4
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline font-medium
                  prose-img:rounded-2xl prose-img:shadow-lg prose-img:my-8
                  prose-blockquote:border-l-4 prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:rounded-r-2xl prose-blockquote:py-3.5 prose-blockquote:px-6 prose-blockquote:my-6 prose-blockquote:italic prose-blockquote:text-foreground/90
                  prose-code:text-primary prose-code:bg-primary/10 prose-code:rounded prose-code:px-1.5 prose-code:py-0.5
                  prose-strong:text-foreground prose-strong:font-bold
                  prose-li:text-muted-foreground/90 prose-li:leading-relaxed
                "
                dangerouslySetInnerHTML={{ __html: processedContent }}
              />

              {/* Share buttons */}
              <div className="mt-10 pt-6 border-t border-border/50">
                <ShareButtons title={post.title} />
              </div>

              {/* Coupons display */}
              <BlogCouponsWidget postId={post.id} />
            </article>
          </motion.div>

          {/* Sidebar (TOC only, sticky inside article grid) */}
          <aside className="lg:col-span-4 hidden lg:block">
            <div className="lg:sticky lg:top-24">
              <TableOfContents
                headings={headings}
                activeId={activeId}
                onHeadingClick={handleHeadingClick}
              />
            </div>
          </aside>
        </div>

        {/* Lower Section for widgets: Related Rooms, Related Posts, Comments (full width) */}
        <div className="space-y-8 mt-8">
          {/* Related Rooms (Article-to-Room Linking) */}
          {post.province && (
            <RelatedRooms
              provinceId={post.province.id}
              provinceName={post.province.name}
            />
          )}

          {/* Related posts */}
          {relatedPosts.length > 0 && (
            <section className="py-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Bài viết liên quan
                </h2>
                {/* Navigation arrows (desktop/tablet only) */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => handleRelatedScroll("left")}
                    disabled={!canScrollLeft}
                    className="p-2.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-95 shadow-2xs hover:shadow-md flex items-center justify-center"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => handleRelatedScroll("right")}
                    disabled={!canScrollRight}
                    className="p-2.5 rounded-full border border-border/60 bg-card text-foreground hover:text-primary hover:border-primary/30 transition-all duration-300 disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-95 shadow-2xs hover:shadow-md flex items-center justify-center"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <div
                ref={relatedScrollRef}
                className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide snap-x snap-mandatory scroll-smooth w-full"
              >
                {relatedPosts.map((rp) => (
                  <motion.div
                    key={rp.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="shrink-0 snap-start w-70 sm:w-[320px] md:w-[calc((100%-16px)/2)] lg:w-[calc((100%-32px)/3)]"
                  >
                    <Link href={`/blog/${rp.slug}`} className="block h-full">
                      <div className="bg-card border border-border/60 rounded-2xl overflow-hidden group cursor-pointer hover:shadow-lg hover:border-primary/20 transition-all duration-300 shadow-xs h-full flex flex-col justify-between">
                        <div className="relative h-36 w-full overflow-hidden shrink-0">
                          {rp.thumbnailUrl ? (
                            <Image
                              src={rp.thumbnailUrl}
                              alt={rp.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-linear-to-br from-primary/10 to-accent/20" />
                          )}
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between min-h-30">
                          <div>
                            <span className="text-xs text-primary font-medium">
                              {rp.category?.name}
                            </span>
                            <h3 className="text-sm font-semibold mt-1 line-clamp-2 group-hover:text-primary transition-colors">
                              {rp.title}
                            </h3>
                          </div>
                          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/20 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock size={10} />
                              {rp.readingTime || 5} phút đọc
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Comments */}
          <div id="comments-section">
            <CommentSection slug={post.slug} />
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar for Mobile/Tablet */}
      <div className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[85%] max-w-[320px] bg-background/90 dark:bg-background/95 backdrop-blur-lg border border-border/60 rounded-full shadow-lg px-4 py-1.5 flex items-center justify-between transition-all duration-300">
        <Link
          href="/blog"
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer px-2"
        >
          <ArrowLeft size={15} />
          <span className="text-[8px] font-bold">Blog</span>
        </Link>

        <button
          onClick={() => {
            const commentEl = document.getElementById("comments-section");
            if (commentEl) {
              commentEl.scrollIntoView({ behavior: "smooth" });
            }
          }}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer px-2"
        >
          <div className="relative">
            <MessageCircle size={15} />
            {post.commentCount !== undefined && post.commentCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-primary text-white text-[7px] font-extrabold w-3.5 h-3.5 rounded-full flex items-center justify-center scale-90">
                {post.commentCount}
              </span>
            )}
          </div>
          <span className="text-[8px] font-bold">Bình luận</span>
        </button>

        <button
          onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({
                  title: post.title,
                  text: post.excerpt || "",
                  url: window.location.href,
                });
              } catch (err) {}
            } else {
              try {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Đã sao chép liên kết bài viết!");
              } catch {}
            }
          }}
          className="flex flex-col items-center gap-0.5 text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer px-2"
        >
          <Share2 size={15} />
          <span className="text-[8px] font-bold">Chia sẻ</span>
        </button>

        {headings.length >= 2 && (
          <button
            onClick={() => setIsMobileTocOpen(true)}
            className="flex flex-col items-center gap-0.5 text-primary hover:text-primary/80 transition-colors duration-200 cursor-pointer px-2"
          >
            <List size={15} />
            <span className="text-[8px] font-extrabold">Mục lục</span>
          </button>
        )}
      </div>

      {/* Mobile TOC Bottom Sheet */}
      <AnimatePresence>
        {isMobileTocOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileTocOpen(false)}
              className="lg:hidden fixed inset-0 bg-black z-50 cursor-pointer"
            />
            {/* Sheet content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="lg:hidden fixed bottom-0 left-0 right-0 max-h-[70vh] bg-background border-t border-border/60 rounded-t-3xl shadow-2xl z-50 overflow-hidden flex flex-col pb-8"
            >
              {/* Drag indicator */}
              <div className="w-12 h-1.5 bg-muted/60 rounded-full mx-auto my-3" />

              <div className="px-5 py-2 flex items-center justify-between border-b border-border/30">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <List size={16} className="text-primary" />
                  Mục lục bài viết
                </h4>
                <button
                  onClick={() => setIsMobileTocOpen(false)}
                  className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="overflow-y-auto px-5 py-4 space-y-2.5 max-h-[50vh] scrollbar-none">
                {headings.map((h) => {
                  const isActive = activeId === h.id;
                  return (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      onClick={(e) => {
                        setIsMobileTocOpen(false);
                        handleHeadingClick(e, h.id);
                      }}
                      className={`block text-sm py-2 px-3.5 rounded-xl transition-all duration-200 border-l-3 ${
                        h.level === 3 ? "ml-4" : ""
                      } ${
                        isActive
                          ? "border-primary text-primary font-bold bg-primary/5 shadow-2xs"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {h.text}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      {showScrollTop && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="hidden lg:block fixed bottom-6 right-6 p-3 rounded-full bg-card border border-border/60 shadow-lg hover:shadow-xl transition-all z-40 cursor-pointer"
        >
          <ArrowUp size={20} className="text-primary" />
        </motion.button>
      )}
    </>
  );
}
