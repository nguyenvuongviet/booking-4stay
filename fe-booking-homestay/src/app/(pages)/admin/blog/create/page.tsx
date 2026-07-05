"use client";

import {
  createPost,
  createTag,
  delete_blog_image,
  upload_blog_image,
  type CreatePostData,
} from "@/services/admin/blogApi";
import {
  getCategories,
  getTags,
  type BlogCategory,
  type BlogTag,
} from "@/services/blogApi";
import { getLocation } from "@/services/locationApi";
import { ChevronLeft, Globe, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import BlogForm, { type BlogFormData } from "../_components/BlogForm";

interface Province {
  id: number;
  name: string;
}

export default function CreateBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

  // Theo dõi tất cả ảnh đã upload trong phiên này để dọn dẹp khi hủy
  const uploadedImagesRef = useRef<string[]>([]);

  // Auto fill tracking
  const [isMetaTitleEdited, setIsMetaTitleEdited] = useState(false);
  const [isMetaDescEdited, setIsMetaDescEdited] = useState(false);

  // Form state
  const [form, setForm] = useState<CreatePostData>({
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
    Promise.all([getCategories(), getTags(), getLocation({ pageSize: 1000 })])
      .then(([cats, ts, provsRes]) => {
        setCategories(cats);
        setTags(ts);
        setProvinces(provsRes?.items || []);
      })
      .catch((err) => console.error("Error loading form data:", err));
  }, []);

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

  const updateForm = (field: keyof BlogFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tagId: number) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds?.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...(prev.tagIds || []), tagId],
    }));
  };

  const handleSubmit = async (publish = false) => {
    if (!form.title.trim()) {
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
      const post = await createPost(form);

      if (publish) {
        const { changePostStatus } = await import("@/services/admin/blogApi");
        await changePostStatus(post.id, "PUBLISHED");
        toast.success("Đã xuất bản bài viết!");
      } else {
        toast.success("Đã lưu bản nháp!");
      }

      router.push("/admin/blog");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi tạo bài viết");
    } finally {
      setSaving(false);
    }
  };

  // Xóa ảnh trên Cloudinary khi bấm nút X
  const handleDeleteImage = async (imageUrl: string) => {
    try {
      await delete_blog_image(imageUrl);
      // Xóa khỏi danh sách ảnh đã upload trong phiên
      uploadedImagesRef.current = uploadedImagesRef.current.filter(
        (url) => url !== imageUrl,
      );
    } catch {
      // Bỏ qua lỗi xóa ảnh, vẫn xóa trên UI
    }
  };

  // Dọn dẹp ảnh mồ côi khi bấm Hủy
  const handleCancel = async () => {
    // Xóa tất cả ảnh đã upload trong phiên mà chưa được lưu vào bài viết
    const orphanImages = [...uploadedImagesRef.current];
    if (orphanImages.length > 0) {
      await Promise.allSettled(
        orphanImages.map((url) => delete_blog_image(url)),
      );
    }
    router.push("/admin/blog");
  };

  return (
    <div className="space-y-4 sm:space-y-6 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/blog"
          className="-ml-2 p-2 rounded-lg hover:bg-accent transition-colors"
        >
          <ChevronLeft size={20} />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Viết bài mới</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Tạo bài viết blog mới cho 4Stay
          </p>
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-4 sm:pt-6 border-t mt-4 sm:mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="w-full sm:w-auto px-5 py-2.5 border rounded-xl text-sm font-semibold hover:bg-accent transition-colors cursor-pointer bg-background"
          >
            Hủy
          </button>
          <button
            onClick={() => handleSubmit(false)}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 border rounded-xl text-sm font-semibold hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer bg-background"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Lưu nháp
          </button>
          <button
            onClick={() => handleSubmit(true)}
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Globe size={16} />
            )}
            Xuất bản
          </button>
        </div>
      </div>
    </div>
  );
}
