"use client";

import {
  createTag,
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
import {
  ChevronLeft,
  Loader2,
  MapPin,
  Plus,
  Save,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { RichTextEditor } from "../../_components/RichTextEditor";

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
  const [provinceSearch, setProvinceSearch] = useState("");
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  const [form, setForm] = useState<UpdatePostData>({
    title: "",
    categoryId: 0,
    content: "",
    excerpt: "",
    thumbnailUrl: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    promotionBanner: "",
    isFeatured: false,
    tagIds: [],
    provinceId: undefined,
  });

  const [uploadingFile, setUploadingFile] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");
  const [creatingTag, setCreatingTag] = useState(false);

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
          promotionBanner: post.promotionBanner || "",
          isFeatured: post.isFeatured,
          tagIds: post.tags?.map((t) => t.id) || [],
          provinceId: post.province?.id || undefined,
        });
      } catch (err) {
        toast.error("Lỗi tải bài viết");
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, [postId]);

  const updateForm = (field: string, value: any) => {
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

      <div className="max-w-6xl mx-auto w-full space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tiêu đề *
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Mô tả ngắn
              </label>
              <textarea
                value={form.excerpt}
                onChange={(e) => updateForm("excerpt", e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                maxLength={500}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Nội dung *
              </label>
              <RichTextEditor
                content={form.content || ""}
                onChange={(html) => updateForm("content", html)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 items-center gap-2">
                <Sparkles size={14} className="text-amber-500" />
                Banner khuyến mãi
              </label>
              <input
                type="text"
                value={form.promotionBanner}
                onChange={(e) => updateForm("promotionBanner", e.target.value)}
                placeholder="🎁 Nhận ngay ưu đãi 5% khi book phòng tại Đà Lạt!"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* SEO */}
            <div className="border rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                SEO & Meta Tags
              </h3>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Meta Title (≤70 ký tự)
                </label>
                <input
                  type="text"
                  value={form.metaTitle}
                  onChange={(e) => updateForm("metaTitle", e.target.value)}
                  placeholder="Để trống sẽ dùng tiêu đề bài viết"
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={70}
                />
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(form.metaTitle || "").length}/70
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Meta Description (≤160 ký tự)
                </label>
                <textarea
                  value={form.metaDescription}
                  onChange={(e) =>
                    updateForm("metaDescription", e.target.value)
                  }
                  placeholder="Để trống sẽ dùng excerpt hoặc tự tạo"
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={160}
                />
                <p className="text-xs text-muted-foreground mt-0.5">
                  {(form.metaDescription || "").length}/160
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">
                  Keywords (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={form.metaKeywords}
                  onChange={(e) => updateForm("metaKeywords", e.target.value)}
                  placeholder="đà lạt, du lịch, homestay, cẩm nang"
                  className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  maxLength={255}
                />
              </div>

              {/* SEO Preview */}
              <div className="border rounded-lg p-4 bg-white">
                <p className="text-xs text-muted-foreground mb-2 font-medium">
                  Xem trước trên Google:
                </p>
                <div className="space-y-0.5">
                  <p className="text-xs text-green-700 truncate">
                    4stay.com › blog ›{" "}
                    {form.title
                      ? form.title
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .slice(0, 40)
                      : "slug-bai-viet"}
                  </p>
                  <p className="text-base text-blue-800 font-medium truncate hover:underline cursor-pointer">
                    {form.metaTitle || form.title || "Tiêu đề bài viết"} | 4Stay
                    Blog
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {form.metaDescription ||
                      form.excerpt ||
                      "Mô tả bài viết sẽ hiển thị tại đây..."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border rounded-xl p-5">
              <label className="block text-sm font-semibold mb-3">
                Danh mục *
              </label>
              <select
                value={form.categoryId}
                onChange={(e) =>
                  updateForm("categoryId", Number(e.target.value))
                }
                className="w-full px-3 py-2.5 rounded-lg border text-sm"
              >
                <option value={0}>Chọn danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="border rounded-xl p-5">
              <label className="block text-sm font-semibold mb-2 items-center gap-2">
                <MapPin size={14} className="text-primary" />
                Tỉnh thành liên kết
              </label>

              {/* Custom Searchable Dropdown for Province */}
              <div className="relative">
                <div
                  onClick={() => setShowProvinceDropdown(!showProvinceDropdown)}
                  className="w-full px-3 py-2.5 rounded-lg border text-sm bg-background flex items-center justify-between cursor-pointer hover:border-primary/50 transition-colors focus:outline-none"
                >
                  <span className="truncate">
                    {provinces.find((p) => p.id === form.provinceId)?.name ||
                      "Không liên kết"}
                  </span>
                  <span className="text-muted-foreground/60 text-[10px] ml-2">
                    ▼
                  </span>
                </div>

                {showProvinceDropdown && (
                  <div className="absolute z-50 w-full mt-1 bg-background border rounded-lg shadow-lg p-2 space-y-2 max-h-64 flex flex-col">
                    <input
                      type="text"
                      value={provinceSearch}
                      onChange={(e) => setProvinceSearch(e.target.value)}
                      placeholder="Tìm kiếm tỉnh thành..."
                      className="w-full px-3 py-1.5 rounded border text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="overflow-y-auto divide-y text-sm flex-1">
                      <div
                        onClick={() => {
                          updateForm("provinceId", undefined);
                          setShowProvinceDropdown(false);
                          setProvinceSearch("");
                        }}
                        className="px-3 py-2 hover:bg-accent cursor-pointer text-xs text-red-500 font-medium"
                      >
                        Không liên kết
                      </div>
                      {provinces
                        .filter((p) =>
                          p.name
                            .toLowerCase()
                            .includes(provinceSearch.toLowerCase()),
                        )
                        .map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              updateForm("provinceId", p.id);
                              setShowProvinceDropdown(false);
                              setProvinceSearch("");
                            }}
                            className="px-3 py-2 hover:bg-accent cursor-pointer text-xs"
                          >
                            {p.name}
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="border rounded-xl p-5">
              <label className="block text-sm font-semibold mb-3 items-center gap-2">
                <Tag size={14} /> Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTagToggle(tag.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      form.tagIds?.includes(tag.id)
                        ? "bg-primary text-white border-primary"
                        : "bg-background hover:bg-accent border-border"
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
                {tags.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Chưa có tag. Tự thêm ở ô bên dưới nhé.
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t flex gap-2">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="Tự thêm tag mới..."
                  className="flex-1 px-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCreateTag();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={creatingTag || !newTagInput.trim()}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                >
                  {creatingTag ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Plus size={12} />
                  )}
                  Thêm
                </button>
              </div>
            </div>

            <div className="border rounded-xl p-5 space-y-4">
              <label className="block text-sm font-semibold mb-1">
                Ảnh đại diện bài viết
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-accent/40 border-muted hover:border-primary/50 transition-all bg-background">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploadingFile ? (
                        <div className="flex flex-col items-center gap-2">
                          <Loader2
                            size={24}
                            className="animate-spin text-primary"
                          />
                          <p className="text-xs text-muted-foreground">
                            Đang tải ảnh lên...
                          </p>
                        </div>
                      ) : (
                        <>
                          <svg
                            className="w-8 h-8 mb-2 text-muted-foreground/60"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="text-xs text-muted-foreground font-semibold">
                            <span className="text-primary">
                              Click để chọn ảnh
                            </span>{" "}
                            hoặc kéo thả
                          </p>
                          <p className="text-[10px] text-muted-foreground/80 mt-1">
                            PNG, JPG, JPEG, WEBP (Tối đa 5MB)
                          </p>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={uploadingFile}
                    />
                  </label>
                </div>
              </div>

              {form.thumbnailUrl && (
                <div className="relative mt-3 rounded-lg overflow-hidden border group">
                  <img
                    src={form.thumbnailUrl}
                    alt="Thumbnail preview"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => updateForm("thumbnailUrl", "")}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                    title="Xóa ảnh"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="border rounded-xl p-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => updateForm("isFeatured", e.target.checked)}
                  className="w-4 h-4 rounded accent-primary"
                />
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Bài viết nổi bật
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t mt-6">
          <Link
            href="/admin/blog"
            className="px-5 py-2.5 border rounded-xl text-sm font-semibold hover:bg-accent transition-colors cursor-pointer bg-background"
          >
            Hủy
          </Link>
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
