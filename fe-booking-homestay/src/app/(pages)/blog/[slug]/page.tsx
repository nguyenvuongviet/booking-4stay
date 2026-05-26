import { fetchPostBySlug, fetchRelatedPosts } from "@/services/blogServer";
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

  const [post, relatedPosts] = await Promise.all([
    fetchPostBySlug(slug),
    fetchRelatedPosts(slug, 4),
  ]);

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} relatedPosts={relatedPosts} />;
}
