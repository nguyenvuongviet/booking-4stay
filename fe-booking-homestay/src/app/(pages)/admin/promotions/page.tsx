"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import {
  delete_admin_promotion,
  get_admin_promotion_stats,
  get_admin_promotions,
  toggle_admin_promotion,
} from "@/services/admin/promotionsApi";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, EyeOff, Plus, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import PromotionForm from "./_components/PromotionForm";
import PromotionStats from "./_components/PromotionStats";
import PromotionTable from "./_components/PromotionTable";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showStats, setShowStats] = useState(false);

  // Filter states
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Modal states
  const [formOpen, setFormOpen] = useState(false);
  const [editPromo, setEditPromo] = useState<any>(null);

  // Load stats and promotions
  const loadData = async () => {
    setLoading(true);
    try {
      const [promosRes, statsRes] = await Promise.all([
        get_admin_promotions({
          page,
          pageSize: 10,
          search: search || undefined,
          promotionType: typeFilter || undefined,
          status: statusFilter || undefined,
        }),
        get_admin_promotion_stats(),
      ]);

      if (promosRes?.items) {
        setPromotions(promosRes.items);
        setTotalPages(promosRes.pagination?.totalPages || 1);
        setTotalItems(promosRes.pagination?.total || 0);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch {
      toast.error("Không thể tải danh sách mã giảm giá");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, typeFilter, statusFilter, refreshKey]);

  // Handle search with debounce
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      loadData();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleToggle = async (id: number) => {
    try {
      const res = await toggle_admin_promotion(id);
      toast.success(res.message || "Thay đổi trạng thái thành công!");
      // Reload only table/stats
      loadData();
    } catch {
      toast.error("Không thể thay đổi trạng thái hoạt động");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mã giảm giá này?")) return;

    try {
      const res = await delete_admin_promotion(id);
      toast.success(res.message || "Đã xóa mã giảm giá!");
      setRefreshKey((k) => k + 1);
    } catch {
      toast.error("Không thể xóa mã giảm giá");
    }
  };

  const handleEdit = (promo: any) => {
    setEditPromo(promo);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditPromo(null);
    setFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản lý mã giảm giá
          </h1>
          <p className="text-gray-600 mt-1">
            Phát hành, theo dõi và cấu hình các chiến dịch mã giảm giá (Coupon).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            {showStats ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <BarChart3 className="w-4 h-4" />
            )}
            <span>{showStats ? "Ẩn thống kê" : "Xem thống kê"}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setRefreshKey((k) => k + 1)}
            title="Tải lại dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button onClick={handleCreate} className="text-white">
            <Plus className="w-4 h-4 mr-2" /> Thêm Coupon
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <AnimatePresence initial={false}>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0, scale: 0.98 }}
            animate={{ opacity: 1, height: "auto", scale: 1 }}
            exit={{ opacity: 0, height: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <PromotionStats
              kpi={stats.kpiCards}
              topPromotions={stats.topPromotions}
              byType={stats.byType}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Table & Filters */}
      <Card className="p-6 rounded-2xl shadow-sm border bg-white dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
            <Input
              placeholder="Tìm kiếm mã coupon hoặc tên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 border rounded-lg text-sm bg-background border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-40"
          >
            <option value="">Tất cả loại mã</option>
            <option value="SEASONAL">Seasonal</option>
            <option value="WELCOME">Welcome</option>
            <option value="LOYALTY">Loyalty</option>
            <option value="BLOG">Blog</option>
            <option value="THANKYOU">Thankyou</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="h-10 px-3 border rounded-lg text-sm bg-background border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-40"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>

        {/* Promotions List Table */}
        <PromotionTable
          items={promotions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-500">
              Hiển thị {promotions.length} trên tổng số {totalItems} coupon
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={page === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPage(i + 1)}
                  className={page === i + 1 ? "text-white" : ""}
                >
                  {i + 1}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit/Create Form Modal */}
      <PromotionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
        editData={editPromo}
      />
    </div>
  );
}
