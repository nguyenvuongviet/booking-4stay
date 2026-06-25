import {
  fetchLatestPosts,
  fetchPostBySlug,
  fetchRelatedPosts,
} from "@/services/blogServer";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BlogDetailClient from "./_components/BlogDetailClient";

// ==================== Dynamic Metadata (SEO) ====================

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlug(slug);

  if (!post) {
    return {
      title: "Bài viết không tồn tại",
    };
  }

  const title = post.metaTitle || post.title;
  const description =
    post.metaDescription || post.excerpt || "Đọc bài viết trên 4Stay Blog";
  const keywords = post.metaKeywords || undefined;
  const imageUrl = post.thumbnailUrl || undefined;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt || undefined,
      authors: post.author
        ? [`${post.author.firstName} ${post.author.lastName}`]
        : undefined,
      images: imageUrl ? [{ url: imageUrl, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

// ==================== Server Component (Page) ====================

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  const [post, rawRelatedPosts] = await Promise.all([
    fetchPostBySlug(slug),
    fetchRelatedPosts(slug, 30),
  ]);

  if (!post) {
    notFound();
  }

  let relatedPosts = rawRelatedPosts;
  if (relatedPosts.length < 3) {
    const latestPosts = await fetchLatestPosts(30);
    const fillCount = 3 - relatedPosts.length;
    const additionalPosts = latestPosts
      .filter(
        (lp) =>
          lp.slug !== slug && !relatedPosts.some((rp) => rp.slug === lp.slug),
      )
      .slice(0, fillCount);
    relatedPosts = [...relatedPosts, ...additionalPosts];
  }

  // Generate JSON-LD Schema for BlogPosting (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.thumbnailUrl ? [post.thumbnailUrl] : [],
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.publishedAt || post.createdAt,
    author: post.author
      ? {
          "@type": "Person",
          name: `${post.author.firstName} ${post.author.lastName}`,
          image: post.author.avatar || undefined,
        }
      : undefined,
    publisher: {
      "@type": "Organization",
      name: "4Stay Homestay Booking",
      url: "https://4stay.booking.vn",
    },
    description: post.metaDescription || post.excerpt || post.title,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://4stay.booking.vn/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetailClient post={post} relatedPosts={relatedPosts} />
    </>
  );
}
