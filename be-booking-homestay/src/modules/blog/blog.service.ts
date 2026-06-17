import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { blog_comments_status, blog_posts_status } from '@prisma/client';
import {
  sanitizeBlogCategoryData,
  sanitizeBlogCommentData,
  sanitizeBlogPostData,
  sanitizeBlogTagData,
} from 'src/utils/sanitize/blog.sanitize';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from '../prisma/prisma.service';
import {
  calculateReadingTime,
  generateExcerpt,
  generateSlug,
} from './blog.helper';
import {
  CreateCategoryDto,
  CreateCommentDto,
  CreatePostDto,
  CreateTagDto,
  QueryCommentDto,
  QueryPostDto,
  UpdateCategoryDto,
  UpdatePostDto,
} from './dto/blog.dto';

@Injectable()
export class BlogService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // ==================== POSTS ====================

  /**
   * Lấy danh sách bài viết (public) — chỉ PUBLISHED
   */
  async getPosts(query: QueryPostDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 10);
    const { search, categorySlug, tagSlug } = query;

    let skip = 0;
    let take = pageSize;

    if (search) {
      take = pageSize;
      skip = (page - 1) * pageSize;
    } else {
      if (page === 1) {
        take = pageSize + 1;
        skip = 0;
      } else {
        take = pageSize;
        skip = pageSize + 1 + (page - 2) * pageSize;
      }
    }

    const where: any = {
      isDeleted: false,
      status: blog_posts_status.PUBLISHED,
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
        { content: { contains: search } },
      ];
    }

    if (categorySlug) where.category = { slug: categorySlug };

    if (tagSlug) where.tags = { some: { tag: { slug: tagSlug } } };

    const sortBy = query.sortBy || 'publishedAt';
    const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

    let orderBy: any = { publishedAt: 'desc' };
    if (sortBy === 'viewCount') {
      orderBy = { viewCount: sortOrder };
    } else if (sortBy === 'isFeatured') {
      orderBy = [{ isFeatured: sortOrder }, { publishedAt: 'desc' }];
    } else if (sortBy === 'publishedAt') {
      orderBy = { publishedAt: sortOrder };
    }

    const [items, total] = await Promise.all([
      this.prisma.blog_posts.findMany({
        where,
        skip,
        take,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          thumbnailUrl: true,
          viewCount: true,
          readingTime: true,
          isFeatured: true,
          publishedAt: true,
          createdAt: true,
          category: { select: { id: true, name: true, slug: true } },
          author: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          tags: {
            select: { tag: { select: { id: true, name: true, slug: true } } },
          },
          _count: {
            select: {
              comments: {
                where: {
                  isDeleted: false,
                  status: blog_comments_status.APPROVED,
                },
              },
            },
          },
        },
      }),
      this.prisma.blog_posts.count({ where }),
    ]);

    // Flatten tags
    const formattedItems = items.map((item) => ({
      ...item,
      tags: item.tags.map((t) => t.tag),
      commentCount: item._count.comments,
      _count: undefined,
    }));

    let totalPages = 1;
    if (search) {
      totalPages = Math.ceil(total / pageSize);
    } else {
      totalPages =
        total <= pageSize + 1
          ? 1
          : 1 + Math.ceil((total - (pageSize + 1)) / pageSize);
    }

    return {
      items: sanitizeBlogPostData(formattedItems),
      pagination: {
        page,
        pageSize: search ? pageSize : page === 1 ? pageSize + 1 : pageSize,
        total,
        totalPages,
      },
    };
  }

  /**
   * Lấy danh sách bài viết cho Admin — tất cả status
   */
  async getAdminPosts(query: QueryPostDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 10);
    const { search, status } = query;
    const skip = (page - 1) * pageSize;

    const where: any = { isDeleted: false };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.blog_posts.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          author: {
            select: { id: true, firstName: true, lastName: true, avatar: true },
          },
          tags: {
            select: { tag: { select: { id: true, name: true, slug: true } } },
          },
          _count: { select: { comments: { where: { isDeleted: false } } } },
        },
      }),
      this.prisma.blog_posts.count({ where }),
    ]);

    const formattedItems = items.map((item) => ({
      ...item,
      tags: item.tags.map((t) => t.tag),
      commentCount: item._count.comments,
      _count: undefined,
    }));

    return {
      items: sanitizeBlogPostData(formattedItems),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Lấy chi tiết bài viết theo slug (public)
   */
  async getPostBySlug(slug: string) {
    const post = await this.prisma.blog_posts.findFirst({
      where: {
        slug,
        isDeleted: false,
        status: blog_posts_status.PUBLISHED,
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        province: { select: { id: true, name: true } },
        tags: {
          select: { tag: { select: { id: true, name: true, slug: true } } },
        },
        blog_promotions: {
          include: {
            promotion: {
              select: {
                id: true,
                code: true,
                name: true,
                discountType: true,
                discountValue: true,
                maxDiscount: true,
                startDate: true,
                endDate: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: {
            comments: {
              where: {
                isDeleted: false,
                status: blog_comments_status.APPROVED,
              },
            },
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Đã không tìm thấy bài viết');

    const now = new Date();
    const formatted = {
      ...post,
      tags: post.tags.map((t) => t.tag),
      commentCount: post._count.comments,
      _count: undefined,
      promotions: post.blog_promotions
        .filter(
          (bp) =>
            bp.promotion.isActive &&
            new Date(bp.promotion.startDate) <= now &&
            new Date(bp.promotion.endDate) >= now,
        )
        .map((bp) => bp.promotion),
      blog_promotions: undefined,
    };
    return sanitizeBlogPostData(formatted);
  }

  /**
   * Lấy chi tiết bài viết theo ID (admin — bao gồm DRAFT)
   */
  async getPostById(id: number) {
    const post = await this.prisma.blog_posts.findFirst({
      where: { id, isDeleted: false },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
        province: { select: { id: true, name: true } },
        tags: {
          select: { tag: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const formatted = {
      ...post,
      tags: post.tags.map((t) => t.tag),
    };
    return sanitizeBlogPostData(formatted);
  }

  /**
   * Bài viết nổi bật (public)
   */
  async getFeaturedPosts(limit = 4) {
    const posts = await this.prisma.blog_posts.findMany({
      where: {
        isDeleted: false,
        status: blog_posts_status.PUBLISHED,
        isFeatured: true,
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnailUrl: true,
        viewCount: true,
        readingTime: true,
        publishedAt: true,
        category: { select: { id: true, name: true, slug: true } },
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true },
        },
      },
    });
    return sanitizeBlogPostData(posts);
  }

  /**
   * Bài viết liên quan (cùng category hoặc province)
   */
  async getRelatedPosts(slug: string, limit = 4) {
    const currentPost = await this.prisma.blog_posts.findFirst({
      where: { slug, isDeleted: false },
      select: { id: true, categoryId: true, provinceId: true },
    });

    if (!currentPost) return [];

    const where: any = {
      isDeleted: false,
      status: blog_posts_status.PUBLISHED,
      id: { not: currentPost.id },
      OR: [{ categoryId: currentPost.categoryId }],
    };

    if (currentPost.provinceId)
      where.OR.push({ provinceId: currentPost.provinceId });

    const posts = await this.prisma.blog_posts.findMany({
      where,
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnailUrl: true,
        readingTime: true,
        publishedAt: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    return sanitizeBlogPostData(posts);
  }

  /**
   * Bài viết theo tỉnh thành (cho Article-to-Room linking)
   */
  async getPostsByProvince(provinceId: number, limit = 3) {
    const posts = await this.prisma.blog_posts.findMany({
      where: {
        provinceId,
        isDeleted: false,
        status: blog_posts_status.PUBLISHED,
      },
      take: limit,
      orderBy: { publishedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        thumbnailUrl: true,
        readingTime: true,
        publishedAt: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    return sanitizeBlogPostData(posts);
  }

  /**
   * Tải ảnh bài viết lên Cloudinary
   */
  async uploadImage(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Không có file được upload');
    const uploadResult: any = await this.cloudinaryService.uploadImage(
      file.buffer,
      'blogs',
    );
    return {
      message: 'Upload ảnh thành công',
      filename: uploadResult.public_id,
      imgUrl: uploadResult.secure_url,
    };
  }

  /**
   * Trợ thủ tạo unique slug cho Post
   */
  private async resolveUniqueSlug(title: string, excludeId?: number) {
    const baseSlug = generateSlug(title);
    const whereClause: any = { slug: { startsWith: baseSlug } };
    if (excludeId) whereClause.id = { not: excludeId };

    const existingSlugs = (
      await this.prisma.blog_posts.findMany({
        where: whereClause,
        select: { slug: true },
      })
    ).map((p) => p.slug);

    let slug = baseSlug;
    if (existingSlugs.includes(slug)) {
      let counter = 1;
      while (existingSlugs.includes(`${baseSlug}-${counter}`)) counter++;
      slug = `${baseSlug}-${counter}`;
    }
    return slug;
  }

  /**
   * Tạo bài viết mới (Admin)
   */
  async createPost(authorId: number, dto: CreatePostDto) {
    // Generate slug từ title
    const slug = await this.resolveUniqueSlug(dto.title);

    // Auto-calculate readingTime and excerpt
    const readingTime = calculateReadingTime(dto.content);
    const excerpt = dto.excerpt || generateExcerpt(dto.content);

    const post = await this.prisma.blog_posts.create({
      data: {
        title: dto.title,
        slug,
        categoryId: dto.categoryId,
        authorId,
        provinceId: dto.provinceId || null,
        excerpt,
        content: dto.content,
        thumbnailUrl: dto.thumbnailUrl || null,
        metaTitle: dto.metaTitle || null,
        metaDescription: dto.metaDescription || null,
        metaKeywords: dto.metaKeywords || null,
        isFeatured: dto.isFeatured || false,
        readingTime,
        status: blog_posts_status.DRAFT,
      },
    });

    // Attach tags
    if (dto.tagIds && dto.tagIds.length > 0) {
      await this.prisma.blog_post_tags.createMany({
        data: dto.tagIds.map((tagId) => ({
          postId: post.id,
          tagId,
        })),
        skipDuplicates: true,
      });
    }

    return this.getPostById(post.id);
  }

  /**
   * Cập nhật bài viết (Admin)
   */
  async updatePost(id: number, dto: UpdatePostDto) {
    const existing = await this.prisma.blog_posts.findFirst({
      where: { id, isDeleted: false },
    });

    if (!existing) throw new NotFoundException('Bài viết không tồn tại');

    // Re-generate slug nếu title thay đổi
    let slug = existing.slug;
    if (dto.title && dto.title !== existing.title)
      slug = await this.resolveUniqueSlug(dto.title, id);

    // Re-calculate readingTime nếu content thay đổi
    const content = dto.content || existing.content;
    const readingTime = calculateReadingTime(content);
    const excerpt =
      dto.excerpt !== undefined
        ? dto.excerpt
        : !existing.excerpt
          ? generateExcerpt(content)
          : existing.excerpt;

    await this.prisma.blog_posts.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        slug,
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.provinceId !== undefined && {
          provinceId: dto.provinceId,
        }),
        excerpt,
        ...(dto.content && { content: dto.content }),
        ...(dto.thumbnailUrl !== undefined && {
          thumbnailUrl: dto.thumbnailUrl || null,
        }),
        ...(dto.metaTitle !== undefined && {
          metaTitle: dto.metaTitle || null,
        }),
        ...(dto.metaDescription !== undefined && {
          metaDescription: dto.metaDescription || null,
        }),
        ...(dto.metaKeywords !== undefined && {
          metaKeywords: dto.metaKeywords || null,
        }),

        ...(dto.isFeatured !== undefined && { isFeatured: dto.isFeatured }),
        readingTime,
        updatedAt: new Date(),
      },
    });

    // Update tags (replace all)
    if (dto.tagIds !== undefined) {
      await this.prisma.blog_post_tags.deleteMany({ where: { postId: id } });
      if (dto.tagIds.length > 0) {
        await this.prisma.blog_post_tags.createMany({
          data: dto.tagIds.map((tagId) => ({ postId: id, tagId })),
          skipDuplicates: true,
        });
      }
    }

    return this.getPostById(id);
  }

  /**
   * Thay đổi trạng thái bài viết (Admin)
   */
  async changePostStatus(id: number, status: blog_posts_status) {
    const post = await this.prisma.blog_posts.findFirst({
      where: { id, isDeleted: false },
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const data: any = { status, updatedAt: new Date() };

    // Set publishedAt khi publish lần đầu
    if (status === blog_posts_status.PUBLISHED && !post.publishedAt)
      data.publishedAt = new Date();

    await this.prisma.blog_posts.update({ where: { id }, data });

    return { message: `Đã chuyển trạng thái sang ${status}` };
  }

  /**
   * Soft delete bài viết (Admin)
   */
  async deletePost(id: number) {
    const post = await this.prisma.blog_posts.findFirst({
      where: { id, isDeleted: false },
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    await this.prisma.blog_posts.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { message: 'Đã xóa bài viết' };
  }

  /**
   * Tăng view count (public)
   */
  async incrementView(slug: string) {
    const post = await this.prisma.blog_posts.findFirst({
      where: { slug, isDeleted: false, status: blog_posts_status.PUBLISHED },
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    await this.prisma.blog_posts.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    });

    return { viewCount: post.viewCount + 1 };
  }

  // ==================== CATEGORIES ====================

  async getCategories() {
    const categories = await this.prisma.blog_categories.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                isDeleted: false,
                status: blog_posts_status.PUBLISHED,
              },
            },
          },
        },
      },
    });
    return sanitizeBlogCategoryData(categories);
  }

  async createCategory(dto: CreateCategoryDto) {
    const slug = generateSlug(dto.name);

    const existing = await this.prisma.blog_categories.findFirst({
      where: { slug },
    });
    if (existing) throw new BadRequestException('Danh mục đã tồn tại');

    const category = await this.prisma.blog_categories.create({
      data: {
        name: dto.name,
        slug,
        description: dto.description || null,
        position: dto.position || 0,
      },
    });
    return sanitizeBlogCategoryData(category);
  }

  async updateCategory(id: number, dto: UpdateCategoryDto) {
    const existing = await this.prisma.blog_categories.findUnique({
      where: { id },
    });

    if (!existing) throw new NotFoundException('Danh mục không tồn tại');

    let slug = existing.slug;
    if (dto.name && dto.name !== existing.name) slug = generateSlug(dto.name);

    const category = await this.prisma.blog_categories.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        slug,
        ...(dto.description !== undefined && {
          description: dto.description || null,
        }),
        ...(dto.position !== undefined && { position: dto.position }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        updatedAt: new Date(),
      },
    });
    return sanitizeBlogCategoryData(category);
  }

  async deleteCategory(id: number) {
    const category = await this.prisma.blog_categories.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: { where: { isDeleted: false } } } },
      },
    });

    if (!category) throw new NotFoundException('Danh mục không tồn tại');

    if (category._count.posts > 0)
      throw new BadRequestException(
        `Không thể xóa danh mục đang có ${category._count.posts} bài viết`,
      );

    await this.prisma.blog_categories.delete({ where: { id } });
    return { message: 'Đã xóa danh mục' };
  }

  // ==================== TAGS ====================

  async getTags() {
    const tags = await this.prisma.blog_tags.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: {
            posts: {
              where: {
                post: {
                  isDeleted: false,
                  status: blog_posts_status.PUBLISHED,
                },
              },
            },
          },
        },
      },
    });
    return sanitizeBlogTagData(tags);
  }

  async createTag(dto: CreateTagDto) {
    const slug = generateSlug(dto.name);

    const existing = await this.prisma.blog_tags.findFirst({ where: { slug } });
    if (existing) throw new BadRequestException('Tag đã tồn tại');

    const tag = await this.prisma.blog_tags.create({
      data: { name: dto.name, slug },
    });
    return sanitizeBlogTagData(tag);
  }

  async deleteTag(id: number) {
    const tag = await this.prisma.blog_tags.findUnique({ where: { id } });

    if (!tag) throw new NotFoundException('Tag không tồn tại');

    // Xóa liên kết post_tags trước
    await this.prisma.blog_post_tags.deleteMany({ where: { tagId: id } });
    await this.prisma.blog_tags.delete({ where: { id } });

    return { message: 'Đã xóa tag' };
  }

  // ==================== COMMENTS ====================

  /**
   * Lấy comments theo bài viết (public, phân trang)
   */
  async getComments(slug: string, query: QueryCommentDto) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 10);
    const skip = (page - 1) * pageSize;

    const post = await this.prisma.blog_posts.findFirst({
      where: { slug, isDeleted: false, status: blog_posts_status.PUBLISHED },
      select: { id: true },
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const [items, total] = await Promise.all([
      this.prisma.blog_comments.findMany({
        where: {
          postId: post.id,
          isDeleted: false,
          status: blog_comments_status.APPROVED,
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.blog_comments.count({
        where: {
          postId: post.id,
          isDeleted: false,
          status: blog_comments_status.APPROVED,
        },
      }),
    ]);

    return {
      items: sanitizeBlogCommentData(items),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Tạo comment (user đã đăng nhập)
   */
  async createComment(slug: string, userId: number, dto: CreateCommentDto) {
    const post = await this.prisma.blog_posts.findFirst({
      where: { slug, isDeleted: false, status: blog_posts_status.PUBLISHED },
      select: { id: true },
    });

    if (!post) throw new NotFoundException('Bài viết không tồn tại');

    const comment = await this.prisma.blog_comments.create({
      data: {
        postId: post.id,
        userId,
        content: dto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return sanitizeBlogCommentData(comment);
  }

  /**
   * Xóa comment (user xóa comment của mình, hoặc admin xóa bất kỳ)
   */
  async deleteComment(commentId: number, userId: number, isAdmin = false) {
    const comment = await this.prisma.blog_comments.findFirst({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    // Chỉ cho phép xóa nếu là chủ comment hoặc admin
    if (!isAdmin && comment.userId !== userId)
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');

    await this.prisma.blog_comments.update({
      where: { id: commentId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    return { message: 'Đã xóa bình luận' };
  }

  /**
   * Lấy tất cả comments (admin, phân trang + filter)
   */
  async getAdminComments(
    query: QueryCommentDto & { postId?: number; reported?: string },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.max(1, Number(query.pageSize) || 10);
    const skip = (page - 1) * pageSize;
    const postId = query.postId ? Number(query.postId) : undefined;
    const status = query.status as blog_comments_status | undefined;
    const reported = query.reported;

    const where: any = { isDeleted: false };
    if (postId) where.postId = postId;
    if (status) {
      where.status = status;
    } else if (reported === 'true') {
      where.status = { not: 'SPAM' };
    }
    if (reported === 'true') where.reportCount = { gt: 0 };

    const orderBy: any =
      reported === 'true' ? { updatedAt: 'desc' } : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.blog_comments.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          post: { select: { id: true, title: true, slug: true } },
        },
      }),
      this.prisma.blog_comments.count({ where }),
    ]);

    return {
      items: sanitizeBlogCommentData(items),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Cập nhật trạng thái bình luận (admin)
   */
  async updateCommentStatus(commentId: number, status: blog_comments_status) {
    const comment = await this.prisma.blog_comments.findFirst({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    const dataToUpdate: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'APPROVED' || status === 'SPAM')
      dataToUpdate.reportCount = 0;

    return this.prisma.blog_comments.update({
      where: { id: commentId },
      data: dataToUpdate,
    });
  }

  /**
   * Báo cáo bình luận (public)
   */
  async reportComment(commentId: number) {
    const comment = await this.prisma.blog_comments.findFirst({
      where: { id: commentId, isDeleted: false },
    });

    if (!comment) throw new NotFoundException('Bình luận không tồn tại');

    return this.prisma.blog_comments.update({
      where: { id: commentId },
      data: {
        reportCount: { increment: 1 },
        updatedAt: new Date(),
      },
    });
  }
}
