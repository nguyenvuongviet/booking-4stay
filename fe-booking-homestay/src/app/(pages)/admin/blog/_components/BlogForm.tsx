"use client";

import type { BlogCategory, BlogTag } from "@/services/blogApi";
import {
  Loader2,
  MapPin,
  Plus,
  Sparkles,
  Tag,
  UploadCloud,
  X,
} from "lucide-react";
import React, { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";

export interface BlogFormData {
  title: string;
  categoryId: number;
  content: string;
  excerpt: string;
  thumbnailUrl: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  isFeatured: boolean;
  tagIds: number[];
  provinceId: number | null;
}

interface BlogFormProps {
  form: BlogFormData;
  updateForm: (field: keyof BlogFormData, value: any) => void;
  categories: BlogCategory[];
  provinces: any[];
  tags: BlogTag[];
  uploadingFile: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  newTagInput: string;
  setNewTagInput: (val: string) => void;
  creatingTag: boolean;
  handleCreateTag: () => void;
  handleTagToggle: (tagId: number) => void;
  isMetaTitleEdited: boolean;
  setIsMetaTitleEdited: (val: boolean) => void;
  isMetaDescEdited: boolean;
  setIsMetaDescEdited: (val: boolean) => void;
}

export default function BlogForm({
  form,
  updateForm,
  categories,
  provinces,
  tags,
  uploadingFile,
  handleFileChange,
  newTagInput,
  setNewTagInput,
  creatingTag,
  handleCreateTag,
  handleTagToggle,
  isMetaTitleEdited,
  setIsMetaTitleEdited,
  isMetaDescEdited,
  setIsMetaDescEdited,
}: BlogFormProps) {
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
  const [provinceSearch, setProvinceSearch] = useState("");

  return (
    <div className="max-w-6xl mx-auto w-full space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Tiêu đề bài viết <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => {
                const val = e.target.value;
                updateForm("title", val);
                // Auto fill Meta Title if not edited
                if (!isMetaTitleEdited) {
                  updateForm("metaTitle", val.slice(0, 70));
                }
              }}
              placeholder="Ví dụ: Kinh nghiệm du lịch Đà Lạt 2025"
              className="w-full px-4 py-3 rounded-xl border text-base focus:outline-none focus:ring-2 focus:ring-primary/30"
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {form.title.length}/255 ký tự
            </p>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Mô tả ngắn (excerpt)
            </label>
            <textarea
              value={form.excerpt}
              onChange={(e) => {
                const val = e.target.value;
                updateForm("excerpt", val);
                // Auto fill Meta Description if not edited
                if (!isMetaDescEdited) {
                  updateForm("metaDescription", val.slice(0, 160));
                }
              }}
              placeholder="Mô tả ngắn gọn nội dung bài viết (dùng làm meta description)"
              rows={3}
              className="w-full px-4 py-3 rounded-xl border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {(form.excerpt || "").length}/500 ký tự · Nếu để trống sẽ tự tạo
              từ nội dung
            </p>
          </div>

          {/* Content - TipTap */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Nội dung bài viết <span className="text-red-500">*</span>
            </label>
            <RichTextEditor
              content={form.content}
              onChange={(html: string) => updateForm("content", html)}
              placeholder="Bắt đầu viết nội dung bài viết tại đây..."
            />
          </div>

          {/* SEO Section */}
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
                onChange={(e) => {
                  const val = e.target.value;
                  updateForm("metaTitle", val);
                  if (!val.trim()) {
                    setIsMetaTitleEdited(false);
                    updateForm("metaTitle", form.title.slice(0, 70));
                  } else {
                    setIsMetaTitleEdited(true);
                  }
                }}
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
                onChange={(e) => {
                  const val = e.target.value;
                  updateForm("metaDescription", val);
                  if (!val.trim()) {
                    setIsMetaDescEdited(false);
                    updateForm("metaDescription", form.excerpt.slice(0, 160));
                  } else {
                    setIsMetaDescEdited(true);
                  }
                }}
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
                    ? form.title.toLowerCase().replace(/\s+/g, "-").slice(0, 40)
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
          {/* Category */}
          <div className="border rounded-xl p-5">
            <label className="block text-sm font-semibold mb-3">
              Danh mục <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => updateForm("categoryId", Number(e.target.value))}
              className="w-full px-3 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value={0}>Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Province (Article-to-Room) */}
          <div className="border rounded-xl p-5">
            <label className="flex items-center gap-2 text-sm font-semibold mb-2">
              <MapPin size={14} className="text-primary" />
              Tỉnh thành liên kết
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              Liên kết bài viết với phòng homestay ở tỉnh thành này
            </p>

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
                        updateForm("provinceId", null);
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

          {/* Tags */}
          <div className="border rounded-xl p-5">
            <label className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Tag size={14} />
              Tags
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

          {/* Thumbnail */}
          <div className="border rounded-xl p-5 space-y-4">
            <label className="block text-sm font-semibold mb-1">
              Ảnh đại diện bài viết
            </label>

            <div className="space-y-2">
              {!form.thumbnailUrl ? (
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
                          <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground/60" />
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
              ) : (
                <div className="relative rounded-xl overflow-hidden border group">
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
                    className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors shadow-md"
                    title="Xóa ảnh"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Featured */}
          <div className="border rounded-xl p-5">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => updateForm("isFeatured", e.target.checked)}
                className="w-4 h-4 rounded accent-primary"
              />
              <div>
                <span className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Bài viết nổi bật
                </span>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Hiển thị ở Hero section trang Blog
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
