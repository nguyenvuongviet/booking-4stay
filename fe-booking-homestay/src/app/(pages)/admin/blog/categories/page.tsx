"use client";

import {
  createCategory,
  createTag,
  deleteCategory,
  deleteTag,
  getAdminCategories,
  getAdminTags,
  updateCategory,
} from "@/services/admin/blogApi";
import type { BlogCategory, BlogTag } from "@/services/blogApi";
import {
  ChevronLeft,
  Edit,
  Loader2,
  Plus,
  RotateCw,
  Save,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "../../_components/Pagination";

function CategoriesAndTagsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") === "tags" ? "tags" : "categories";
  const [activeTab, setActiveTab] = useState<"categories" | "tags">(initialTab);

  // Update tab if URL search params change
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "tags" || tabParam === "categories") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // ==================== Categories State & Actions ====================
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [catEditId, setCatEditId] = useState<number | null>(null);
  const [showCatCreate, setShowCatCreate] = useState(false);
  const [catForm, setCatForm] = useState({
    name: "",
    description: "",
    position: 0,
  });
  const [catSaving, setCatSaving] = useState(false);

  const [catPage, setCatPage] = useState(1);
  const CATS_PER_PAGE = 5;
  const catTotalPages = Math.ceil(categories.length / CATS_PER_PAGE);
  const paginatedCategories = categories.slice(
    (catPage - 1) * CATS_PER_PAGE,
    catPage * CATS_PER_PAGE,
  );

  useEffect(() => {
    if (catPage > catTotalPages && catTotalPages > 0) {
      setCatPage(catTotalPages);
    }
  }, [categories, catPage, catTotalPages]);

  const fetchCategories = async () => {
    setCatLoading(true);
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch {
      toast.error("Lỗi tải danh mục");
    } finally {
      setCatLoading(false);
    }
  };

  const handleCatCreate = async () => {
    if (!catForm.name.trim()) return toast.error("Nhập tên danh mục");
    setCatSaving(true);
    try {
      await createCategory(catForm);
      toast.success("Đã tạo danh mục");
      setShowCatCreate(false);
      setCatForm({ name: "", description: "", position: 0 });
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi tạo danh mục");
    } finally {
      setCatSaving(false);
    }
  };

  const handleCatUpdate = async (id: number) => {
    if (!catForm.name.trim()) return toast.error("Nhập tên danh mục");
    setCatSaving(true);
    try {
      await updateCategory(id, catForm);
      toast.success("Đã cập nhật danh mục");
      setCatEditId(null);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi cập nhật");
    } finally {
      setCatSaving(false);
    }
  };

  const handleCatDelete = async (id: number) => {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      await deleteCategory(id);
      toast.success("Đã xóa danh mục");
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi xóa");
    }
  };

  const startCatEdit = (cat: BlogCategory) => {
    setCatEditId(cat.id);
    setCatForm({
      name: cat.name,
      description: cat.description || "",
      position: cat.position,
    });
  };

  // ==================== Tags State & Actions ====================
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [newTag, setNewTag] = useState("");
  const [tagCreating, setTagCreating] = useState(false);

  const [tagPage, setTagPage] = useState(1);
  const TAGS_PER_PAGE = 10;
  const tagsTotalPages = Math.ceil(tags.length / TAGS_PER_PAGE);
  const paginatedTags = tags.slice(
    (tagPage - 1) * TAGS_PER_PAGE,
    tagPage * TAGS_PER_PAGE,
  );

  useEffect(() => {
    if (tagPage > tagsTotalPages && tagsTotalPages > 0) {
      setTagPage(tagsTotalPages);
    }
  }, [tags, tagPage, tagsTotalPages]);

  const fetchTags = async () => {
    setTagsLoading(true);
    try {
      const data = await getAdminTags();
      setTags(data);
    } catch {
      toast.error("Lỗi tải tags");
    } finally {
      setTagsLoading(false);
    }
  };

  const handleTagCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setTagCreating(true);
    try {
      await createTag(newTag.trim());
      toast.success("Đã tạo tag");
      setNewTag("");
      fetchTags();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi tạo tag");
    } finally {
      setTagCreating(false);
    }
  };

  const handleTagDelete = async (id: number) => {
    if (!confirm("Xóa tag này?")) return;
    try {
      await deleteTag(id);
      toast.success("Đã xóa tag");
      fetchTags();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi xóa");
    }
  };

  // ==================== Initial Fetch ====================
  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/blog"
            className="-ml-2 p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ChevronLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold">Danh mục &amp; Tags</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={activeTab === "categories" ? fetchCategories : fetchTags}
            disabled={activeTab === "categories" ? catLoading : tagsLoading}
            className="p-2.5 rounded-xl border bg-background hover:bg-accent transition-colors disabled:opacity-50 cursor-pointer animate-none"
            title="Làm mới"
          >
            <RotateCw
              size={18}
              className={
                (activeTab === "categories" ? catLoading : tagsLoading)
                  ? "animate-spin"
                  : ""
              }
            />
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-muted">
        <button
          onClick={() => setActiveTab("categories")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "categories"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📂 Danh mục ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("tags")}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            activeTab === "tags"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          🏷️ Tags ({tags.length})
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "categories" ? (
        <div className="space-y-6 max-w-3xl animate-fadeIn">
          {/* Add Category Trigger Button */}
          {!showCatCreate && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setShowCatCreate(true);
                  setCatForm({
                    name: "",
                    description: "",
                    position: 0,
                  });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-all cursor-pointer"
              >
                <Plus size={18} /> Thêm danh mục
              </button>
            </div>
          )}

          {/* Create form for categories */}
          {showCatCreate && (
            <div className="border rounded-xl p-5 space-y-3 bg-primary/5 animate-fadeIn">
              <h3 className="font-semibold text-sm">Tạo danh mục mới</h3>
              <input
                type="text"
                value={catForm.name}
                onChange={(e) =>
                  setCatForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Tên danh mục"
                className="w-full px-3 py-2 rounded-lg border text-sm bg-background"
              />
              <input
                type="text"
                value={catForm.description}
                onChange={(e) =>
                  setCatForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Mô tả (tuỳ chọn)"
                className="w-full px-3 py-2 rounded-lg border text-sm bg-background"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCatCreate}
                  disabled={catSaving}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 cursor-pointer"
                >
                  {catSaving ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Save size={14} />
                  )}{" "}
                  Lưu
                </button>
                <button
                  onClick={() => setShowCatCreate(false)}
                  className="px-3 py-2 rounded-lg border text-sm hover:bg-accent cursor-pointer bg-background"
                >
                  <X size={14} className="inline mr-1" /> Hủy
                </button>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="border rounded-xl divide-y bg-background overflow-hidden">
            {catLoading &&
              [...Array(4)].map((_, i) => (
                <div key={i} className="p-4 animate-pulse">
                  <div className="h-5 bg-muted/20 rounded w-1/3" />
                </div>
              ))}

            {!catLoading && categories.length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                Chưa có danh mục nào
              </div>
            )}

            {!catLoading &&
              paginatedCategories.map((cat) => (
                <div key={cat.id} className="p-4">
                  {catEditId === cat.id ? (
                    <div className="space-y-2 animate-fadeIn">
                      <input
                        type="text"
                        value={catForm.name}
                        onChange={(e) =>
                          setCatForm((p) => ({ ...p, name: e.target.value }))
                        }
                        className="w-full px-3 py-2 rounded-lg border text-sm bg-background"
                      />
                      <input
                        type="text"
                        value={catForm.description}
                        onChange={(e) =>
                          setCatForm((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Mô tả"
                        className="w-full px-3 py-2 rounded-lg border text-sm bg-background"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCatUpdate(cat.id)}
                          disabled={catSaving}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-medium disabled:opacity-50 cursor-pointer"
                        >
                          {catSaving ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Save size={12} />
                          )}{" "}
                          Lưu
                        </button>
                        <button
                          onClick={() => setCatEditId(null)}
                          className="px-3 py-1.5 rounded-lg border text-xs hover:bg-accent cursor-pointer bg-background"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{cat.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          slug: {cat.slug}
                          {cat.description && ` · ${cat.description}`}
                          {cat._count && ` · ${cat._count.posts} bài viết`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => startCatEdit(cat)}
                          className="p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer"
                        >
                          <Edit size={14} className="text-primary" />
                        </button>
                        <button
                          onClick={() => handleCatDelete(cat.id)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Categories Pagination */}
          {!catLoading && catTotalPages > 1 && (
            <Pagination
              page={catPage}
              pageCount={catTotalPages}
              onPageChange={setCatPage}
            />
          )}
        </div>
      ) : (
        <div className="space-y-6 max-w-2xl animate-fadeIn">
          {/* Create tag inline form */}
          <form onSubmit={handleTagCreate} className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Nhập tên tag mới..."
              className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-background"
              maxLength={50}
            />
            <button
              type="submit"
              disabled={tagCreating || !newTag.trim()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {tagCreating ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Plus size={16} />
              )}
              Thêm
            </button>
          </form>

          {/* Tags List */}
          <div className="flex flex-wrap gap-2 min-h-16">
            {tagsLoading &&
              [...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-8 w-20 bg-muted/20 rounded-full animate-pulse"
                />
              ))}

            {!tagsLoading && tags.length === 0 && (
              <p className="text-sm text-muted-foreground">Chưa có tag nào</p>
            )}

            {!tagsLoading &&
              paginatedTags.map((tag) => (
                <div
                  key={tag.id}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border bg-background hover:bg-accent/50 transition-colors group"
                >
                  <Tag size={12} className="text-primary" />
                  <span className="text-sm font-medium">{tag.name}</span>
                  {tag._count && (
                    <span className="text-xs text-muted-foreground">
                      ({tag._count.posts})
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleTagDelete(tag.id)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 transition-all cursor-pointer"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              ))}
          </div>

          {/* Tags Pagination */}
          {!tagsLoading && tagsTotalPages > 1 && (
            <Pagination
              page={tagPage}
              pageCount={tagsTotalPages}
              onPageChange={setTagPage}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6 max-w-4xl animate-pulse">
          <div className="h-10 bg-muted/20 rounded w-1/3" />
          <div className="h-10 bg-muted/20 rounded" />
          <div className="h-40 bg-muted/20 rounded-xl" />
        </div>
      }
    >
      <CategoriesAndTagsContent />
    </Suspense>
  );
}
