"use client";

import {
  createTag,
  delete_blog_image,
  getAdminPostById,
  updatePost,
  upload_blog_image,
  type UpdatePostData,
} from "@/services/admin/blogApi";
import {
  getCategories,
  getTags,
  type BlogCategory,
  type BlogTag,
} from "@/services/blogApi";
import { getLocation } from "@/services/locationApi";
import { ChevronLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import BlogForm, { type BlogFormData } from "../../_components/BlogForm";

interface Province {
  id: number;
  name: string;
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.id);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);

  const [uploadingFile, setUploadingFile] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  // Theo dõi ảnh mới upload trong phiên chỉnh sửa
  const uploadedImagesRef = useRef<string[]>([]);

  // Auto fill tracking
  const [isMetaTitleEdited, setIsMetaTitleEdited] = useState(false);
  const [isMetaDescEdited, setIsMetaDescEdited] = useState(false);

  const [form, setForm] = useState<UpdatePostData>({
    title: "",
    categoryId: 0,
    content: "",
    excerpt: "",
    thumbnailUrl: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    isFeatured: false,
    tagIds: [],
    provinceId: null,
  });

  useEffect(() => {
    (async () => {
      try {
        const [post, cats, ts, provsRes] = await Promise.all([
          getAdminPostById(postId),
          getCategories(),
          getTags(),
          getLocation({ pageSize: 1000 }),
        ]);

        setCategories(cats);
        setTags(ts);
        setProvinces(provsRes?.items || []);

        setForm({
          title: post.title,
          categoryId: post.category?.id || 0,
          content: post.content || "",
          excerpt: post.excerpt || "",
          thumbnailUrl: post.thumbnailUrl || "",
          metaTitle: post.metaTitle || "",
          metaDescription: post.metaDescription || "",
          metaKeywords: post.metaKeywords || "",
          isFeatured: post.isFeatured,
          tagIds: post.tags?.map((t) => t.id) || [],
          provinceId: post.province?.id || null,
        });

        // Initialize edit states to true if data exists to avoid auto-overwrite on load
        setIsMetaTitleEdited(!!post.metaTitle);
        setIsMetaDescEdited(!!post.metaDescription);
      } catch (err) {
        toast.error("Lỗi tải bài viết");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const updateForm = (field: keyof BlogFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn. Tối đa 5MB");
      return;
    }

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await upload_blog_image(formData);
      if (res?.data?.imgUrl) {
        updateForm("thumbnailUrl", res.data.imgUrl);
        uploadedImagesRef.current.push(res.data.imgUrl);
        toast.success("Tải ảnh lên thành công!");
      } else {
        toast.error("Không nhận được URL ảnh từ server");
      }
    } catch (err: any) {
      console.error("Upload image error:", err);
      toast.error(err?.response?.data?.message || "Lỗi tải ảnh lên");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagInput.trim()) return;
    setCreatingTag(true);
    try {
      const newTagObj = await createTag(newTagInput.trim());
      if (newTagObj) {
        setTags((prev) => [...prev, newTagObj]);
        setForm((prev) => ({
          ...prev,
          tagIds: [...(prev.tagIds || []), newTagObj.id],
        }));
        setNewTagInput("");
        toast.success("Đã tạo tag mới và liên kết!");
      }
    } catch (err: any) {
      console.error("Create tag error:", err);
      toast.error(err?.response?.data?.message || "Lỗi tạo tag");
    } finally {
      setCreatingTag(false);
    }
  };

  const handleTagToggle = (tagId: number) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds?.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...(prev.tagIds || []), tagId],
    }));
  };

  const handleSubmit = async () => {
    if (!form.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề");
      return;
    }
    if (!form.categoryId || form.categoryId === 0) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    if (!form.content || form.content.length < 20) {
      toast.error("Nội dung bài viết quá ngắn");
      return;
    }

    setSaving(true);
    try {
      await updatePost(postId, form);
      toast.success("Đã cập nhật bài viết!");
      router.push("/admin/blog");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật bài viết");
    } finally {
      setSaving(false);
    }
  };

  // Xóa ảnh trên Cloudinary khi bấm nút X (cả ảnh cũ và ảnh mới)
  const handleDeleteImage = async (imageUrl: string) => {
    try {
      await delete_blog_image(imageUrl);
      // Xóa khỏi danh sách ảnh mới upload trong phiên (nếu có)
      uploadedImagesRef.current = uploadedImagesRef.current.filter(
        (url) => url !== imageUrl,
      );
    } catch {
      // Bỏ qua lỗi, vẫn xóa trên UI
    }
  };

  // Dọn dẹp ảnh mồ côi mới khi bấm Hủy (không xóa ảnh cũ đã lưu trong DB)
  const handleCancel = async () => {
    const orphanImages = [...uploadedImagesRef.current];
    if (orphanImages.length > 0) {
      await Promise.allSettled(
        orphanImages.map((url) => delete_blog_image(url)),
      );
    }
    router.push("/admin/blog");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/blog"
          className="-ml-2 p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa bài viết</h1>
          <p className="text-sm text-muted-foreground">ID: #{postId}</p>
        </div>
      </div>

      <BlogForm
        form={form as BlogFormData}
        updateForm={updateForm}
        categories={categories}
        provinces={provinces}
        tags={tags}
        uploadingFile={uploadingFile}
        handleFileChange={handleFileChange}
        onDeleteImage={handleDeleteImage}
        newTagInput={newTagInput}
        setNewTagInput={setNewTagInput}
        creatingTag={creatingTag}
        handleCreateTag={handleCreateTag}
        handleTagToggle={handleTagToggle}
        isMetaTitleEdited={isMetaTitleEdited}
        setIsMetaTitleEdited={setIsMetaTitleEdited}
        isMetaDescEdited={isMetaDescEdited}
        setIsMetaDescEdited={setIsMetaDescEdited}
      />

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="px-5 py-2.5 border rounded-xl text-sm font-semibold hover:bg-accent transition-colors cursor-pointer bg-background"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  );
}
