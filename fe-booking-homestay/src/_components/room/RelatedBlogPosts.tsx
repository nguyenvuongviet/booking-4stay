"use client";

import { getPostsByProvince, type BlogPost } from "@/services/blogApi";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function RelatedBlogPosts({
  provinceId,
  provinceName,
}: {
  provinceId: number;
  provinceName: string;
}) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!provinceId) return;

    getPostsByProvince(provinceId, 3)
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [provinceId]);

  if (loading || posts.length === 0) return null;

  return (
    <section className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
          <BookOpen size={22} className="text-primary" />
          Kinh nghiệm du lịch {provinceName}
        </h2>
        <Link
          href={`/blog?province=${provinceId}`}
          className="hidden md:flex items-center gap-1 text-sm text-primary hover:underline"
        >
          Xem thêm
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Link href={`/blog/${post.slug}`}>
              <div className="bg-card border border-border/60 rounded-2xl overflow-hidden group cursor-pointer h-full hover:shadow-md transition-all duration-300">
                <div className="relative h-36 overflow-hidden">
                  {post.thumbnailUrl ? (
                    <Image
                      src={post.thumbnailUrl}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-primary/10 to-accent/20 flex items-center justify-center">
                      <BookOpen size={24} className="text-primary/30" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-muted/60 border border-muted/70 text-foreground">
                      {post.category?.name}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-primary transition-colors mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock size={10} />
                    <span>{post.readingTime || 5} phút đọc</span>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
