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
import { Pagination } from "../_components/Pagination";
import PromotionForm from "./_components/PromotionForm";
import PromotionStats from "./_components/PromotionStats";
import PromotionTable from "./_components/PromotionTable";

export default function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showStats, setShowStats] = useState(false);

  const [progress, setProgress] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

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

  useEffect(() => {
    if (!autoRefreshEnabled) {
      setProgress(0);
      return;
    }

    const duration = 15000;
    const intervalTime = 100;
    const step = (intervalTime / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          loadData();
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, page, typeFilter, statusFilter, refreshKey]);

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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 sm:pb-4 border-b gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản lý mã giảm giá
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-1">
            Phát hành, theo dõi và cấu hình các chiến dịch mã giảm giá (Coupon).
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 justify-end w-full md:w-auto shrink-0 flex-wrap">
          <div
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`flex items-center gap-2 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border select-none cursor-pointer transition-all ${
              autoRefreshEnabled
                ? "bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
            }`}
            title={autoRefreshEnabled ? "Click để tạm dừng tự động làm mới" : "Click để bật tự động làm mới"}
          >
            <span className="relative flex h-1.5 w-1.5">
              {autoRefreshEnabled && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
                  autoRefreshEnabled ? "bg-emerald-500" : "bg-slate-400"
                }`}
              ></span>
            </span>
            <span>
              {autoRefreshEnabled
                ? `Làm mới sau ${Math.max(1, Math.ceil(15 - (progress * 15) / 100))}s`
                : "Tự động làm mới: Tắt"}
            </span>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowStats(!showStats)}
            className="flex items-center gap-1 sm:gap-1.5 h-9 sm:h-10 text-xs sm:text-sm px-2.5 sm:px-4 cursor-pointer"
          >
            {showStats ? (
              <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
            <span>{showStats ? "Ẩn" : "Thống kê"}</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={async () => {
              await loadData();
              setProgress(0);
            }}
            title="Tải lại dữ liệu"
            className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg cursor-pointer shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          <Button
            onClick={handleCreate}
            className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 text-white cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> Thêm
            Coupon
          </Button>
        </div>
      </div>

      {/* Sleek Auto Refresh Progress Bar */}
      {autoRefreshEnabled && (
        <div className="w-full h-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-full overflow-hidden -mt-2 sm:-mt-3">
          <div
            className="h-full bg-primary/70 transition-all duration-100 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

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

      {/* Sticky Filters */}
      <div className="sticky top-16 sm:top-20 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-md flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm mã coupon hoặc tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-9 sm:h-10 text-xs sm:text-sm rounded-lg sm:rounded-xl border border-slate-300 hover:border-slate-400"
          />
        </div>

        {/* Filters Select */}
        <div className="flex flex-row gap-2.5 sm:gap-3 w-full lg:w-auto">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            className="h-9 sm:h-10 px-2 sm:px-3 border rounded-lg sm:rounded-xl text-xs sm:text-sm bg-background border-slate-350 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/40 flex-1 lg:w-40 lg:flex-initial cursor-pointer"
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
            className="h-9 sm:h-10 px-2 sm:px-3 border rounded-lg sm:rounded-xl text-xs sm:text-sm bg-background border-slate-350 dark:border-slate-800 focus:outline-none focus:ring-1 focus:ring-primary/40 flex-1 lg:w-40 lg:flex-initial cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="expired">Đã hết hạn</option>
          </select>
        </div>
      </div>

      {/* Table Container Card */}
      <Card className="p-3.5 sm:p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm space-y-4 sm:space-y-6">
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
          <Pagination
            page={page}
            pageCount={totalPages}
            onPageChange={setPage}
          />
        )}
      </Card>

      {/* Edit/Create Form Modal */}
      <PromotionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={() => setRefreshKey((k) => k + 1)}
        editData={editPromo}
      />
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
