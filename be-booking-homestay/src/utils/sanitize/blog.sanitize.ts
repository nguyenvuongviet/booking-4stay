import { buildImageUrl, sanitizeCollection } from 'src/utils/object.util';

export function sanitizeBlogCategory(category: any) {
  if (!category) return null;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    position: category.position,
    isActive: category.isActive,
    createdAt: category.createdAt?.toISOString(),
    updatedAt: category.updatedAt?.toISOString(),
    postCount: category._count?.posts ?? undefined,
  };
}

export function sanitizeBlogTag(tag: any) {
  if (!tag) return null;
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    createdAt: tag.createdAt?.toISOString(),
    postCount: tag._count?.posts ?? undefined,
  };
}

export function sanitizeBlogPost(post: any) {
  if (!post) return null;
  return {
    id: post.id,
    categoryId: post.categoryId,
    authorId: post.authorId,
    provinceId: post.provinceId,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    content: post.content,
    thumbnailUrl: buildImageUrl(post.thumbnailUrl),
    metaTitle: post.metaTitle,
    metaDescription: post.metaDescription,
    metaKeywords: post.metaKeywords,
    status: post.status,
    isFeatured: post.isFeatured,
    viewCount: post.viewCount,
    readingTime: post.readingTime,
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
    createdAt: post.createdAt?.toISOString(),
    updatedAt: post.updatedAt?.toISOString(),
    category: post.category
      ? {
          id: post.category.id,
          name: post.category.name,
          slug: post.category.slug,
        }
      : null,
    author: post.author
      ? {
          id: post.author.id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          avatar: buildImageUrl(post.author.avatar),
        }
      : null,
    province: post.province
      ? {
          id: post.province.id,
          name: post.province.name,
        }
      : null,
    tags: Array.isArray(post.tags)
      ? post.tags.map((t: any) => ({
          id: t.id ?? t.tag?.id,
          name: t.name ?? t.tag?.name,
          slug: t.slug ?? t.tag?.slug,
        }))
      : [],
    commentCount: post.commentCount ?? undefined,
  };
}

export function sanitizeBlogComment(comment: any) {
  if (!comment) return null;
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    content: comment.content,
    status: comment.status,
    reportCount: comment.reportCount,
    createdAt: comment.createdAt?.toISOString(),
    updatedAt: comment.updatedAt?.toISOString(),
    user: comment.user
      ? {
          id: comment.user.id,
          firstName: comment.user.firstName,
          lastName: comment.user.lastName,
          avatar: buildImageUrl(comment.user.avatar),
        }
      : null,
    post: comment.post
      ? {
          id: comment.post.id,
          title: comment.post.title,
          slug: comment.post.slug,
        }
      : null,
  };
}

export function sanitizeBlogCategoryData(data: any) {
  return sanitizeCollection(data, sanitizeBlogCategory);
}

export function sanitizeBlogTagData(data: any) {
  return sanitizeCollection(data, sanitizeBlogTag);
}

export function sanitizeBlogPostData(data: any) {
  return sanitizeCollection(data, sanitizeBlogPost);
}

export function sanitizeBlogCommentData(data: any) {
  return sanitizeCollection(data, sanitizeBlogComment);
}
