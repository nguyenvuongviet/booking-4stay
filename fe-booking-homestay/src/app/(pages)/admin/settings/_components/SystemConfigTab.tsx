"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { Skeleton } from "@/_components/ui/skeleton";
import { AppConfigKey } from "@/constants/app.constant";
import { AppConfig, appConfigApi } from "@/services/admin/appConfigApi";
import { Plus, RefreshCw, Settings, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function SystemConfigTab() {
  const [appConfigs, setAppConfigs] = useState<AppConfig[]>([]);
  const [loadingConfigs, setLoadingConfigs] = useState(false);

  const fetchConfigs = async () => {
    setLoadingConfigs(true);
    try {
      const data = await appConfigApi.getAllConfigs();
      setAppConfigs(data);
    } catch (error) {
      toast.error("Không thể tải cấu hình hệ thống");
    } finally {
      setLoadingConfigs(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const handleConfigChange = (key: string, value: any) => {
    setAppConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, value } : c)),
    );
  };

  const saveConfig = async (key: string) => {
    const config = appConfigs.find((c) => c.key === key);
    if (!config) return;

    try {
      await appConfigApi.updateConfig(key, config.value);
      toast.success(`Đã cập nhật cấu hình ${key}`);
      fetchConfigs();
    } catch (error) {
      toast.error("Lỗi khi cập nhật cấu hình");
    }
  };

  if (loadingConfigs && appConfigs.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-3xl">
        <div className="flex justify-between items-center bg-primary/5 p-3 sm:p-4 rounded-xl border border-primary/20">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-40 rounded" />
            <Skeleton className="h-3 w-72 rounded" />
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <Card className="p-3.5 sm:p-6 space-y-4 rounded-2xl bg-card border border-border/60">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-4 w-96 rounded" />
          <div className="flex gap-4 max-w-md mt-4">
            <Skeleton className="h-9 sm:h-11 flex-1 rounded-lg" />
            <Skeleton className="h-9 sm:h-11 w-24 rounded-xl" />
          </div>
        </Card>
        <Card className="p-3.5 sm:p-6 space-y-4 rounded-2xl bg-card border border-border/60">
          <Skeleton className="h-5 w-48 rounded" />
          <Skeleton className="h-4 w-96 rounded" />
          <div className="space-y-3 mt-4">
            <div className="flex gap-4">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-4 w-1/3 rounded" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 flex-1 rounded-lg" />
              <Skeleton className="h-10 w-10 rounded-lg" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-3xl animate-in fade-in-50 duration-200">
      <div className="flex justify-between items-center bg-primary/5 p-3 sm:p-4 rounded-xl border border-primary/20">
        <div>
          <h2 className="text-sm sm:text-base font-bold flex items-center gap-1.5 text-primary">
            <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
            Cấu hình vận hành
          </h2>
          <p className="text-[10px] sm:text-xs text-primary/80 mt-0.5">
            Cấu hình các tham số hoạt động của hệ thống đặt phòng.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchConfigs}
          disabled={loadingConfigs}
          className="h-8 sm:h-9 text-xs gap-1.5 px-3 sm:px-4 rounded-lg cursor-pointer bg-card hover:bg-primary/5 hover:text-primary transition-colors border-primary/20"
        >
          <RefreshCw
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${loadingConfigs ? "animate-spin" : ""}`}
          />
          Làm mới
        </Button>
      </div>

      <Card className="p-3.5 sm:p-6 shadow-sm border border-border/60 rounded-2xl bg-card">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Thời gian hết hạn thanh toán
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Số phút tối đa khách được giữ chỗ chờ thanh toán trước khi hệ thống
            tự động hủy đơn (Mặc định: 30 phút).
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 max-w-md">
          <div className="relative flex-1">
            <Input
              type="number"
              min="5"
              max="1440"
              value={
                appConfigs.find(
                  (c) => c.key === AppConfigKey.BOOKING_EXPIRY_MINUTES,
                )?.value || 30
              }
              onChange={(e) =>
                handleConfigChange(
                  AppConfigKey.BOOKING_EXPIRY_MINUTES,
                  parseInt(e.target.value) || 30,
                )
              }
              className="pr-12 sm:pr-16 text-xs sm:text-sm font-medium h-9 sm:h-11 rounded-lg border-border/80 bg-card focus-visible:ring-primary/20"
            />
            <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground font-semibold">
              phút
            </div>
          </div>
          <Button
            onClick={() => saveConfig(AppConfigKey.BOOKING_EXPIRY_MINUTES)}
            className="bg-primary hover:bg-primary/95 text-white h-9 sm:h-11 px-3 sm:px-5 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold cursor-pointer shadow-sm hover:shadow"
          >
            Cập nhật
          </Button>
        </div>
      </Card>

      <Card className="p-3.5 sm:p-6 shadow-sm border border-border/60 rounded-2xl bg-card">
        <div className="mb-3 sm:mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
            Chính sách phí phạt hủy phòng
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Cấu hình các mốc thời gian trước khi nhận phòng và tỷ lệ hoàn tiền
            tương ứng cho khách hàng khi thực hiện huỷ đơn đặt phòng.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-12 gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-border/60">
            <div className="col-span-5">Huỷ trước (ngày)</div>
            <div className="col-span-5">Hoàn tiền (%)</div>
            <div className="col-span-2 text-right">Thao tác</div>
          </div>

          {(
            appConfigs.find((c) => c.key === AppConfigKey.CANCELLATION_POLICY)
              ?.value || []
          ).map((rule: any, index: number) => (
            <div
              key={index}
              className="grid grid-cols-12 gap-2 sm:gap-4 items-center animate-in fade-in slide-in-from-top-1"
            >
              <div className="col-span-5 relative">
                <Input
                  type="number"
                  value={rule.daysBefore}
                  onChange={(e) => {
                    const newValue = [
                      ...(appConfigs.find(
                        (c) => c.key === AppConfigKey.CANCELLATION_POLICY,
                      )?.value || []),
                    ];
                    newValue[index].daysBefore = parseInt(e.target.value) || 0;
                    handleConfigChange(
                      AppConfigKey.CANCELLATION_POLICY,
                      newValue,
                    );
                  }}
                  className="pr-8 sm:pr-12 h-9 sm:h-10 text-xs sm:text-sm rounded-lg border-border/80 bg-card focus-visible:ring-primary/20"
                />
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground">
                  ngày
                </div>
              </div>
              <div className="col-span-5 relative">
                <Input
                  type="number"
                  value={rule.refundPercent * 100}
                  onChange={(e) => {
                    const newValue = [
                      ...(appConfigs.find(
                        (c) => c.key === AppConfigKey.CANCELLATION_POLICY,
                      )?.value || []),
                    ];
                    newValue[index].refundPercent =
                      (parseInt(e.target.value) || 0) / 100;
                    handleConfigChange(
                      AppConfigKey.CANCELLATION_POLICY,
                      newValue,
                    );
                  }}
                  className="pr-5 sm:pr-8 h-9 sm:h-10 text-xs sm:text-sm rounded-lg border-border/80 bg-card focus-visible:ring-primary/20"
                />
                <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 text-[10px] sm:text-xs text-muted-foreground">
                  %
                </div>
              </div>
              <div className="col-span-2 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg cursor-pointer animate-in fade-in h-8 w-8 sm:h-9 sm:w-9"
                  onClick={() => {
                    const newValue = (
                      appConfigs.find(
                        (c) => c.key === AppConfigKey.CANCELLATION_POLICY,
                      )?.value || []
                    ).filter((_: any, i: number) => i !== index);
                    handleConfigChange(
                      AppConfigKey.CANCELLATION_POLICY,
                      newValue,
                    );
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </Button>
              </div>
            </div>
          ))}

          <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              className="w-full sm:w-auto gap-1.5 rounded-lg cursor-pointer h-8 sm:h-9 text-xs bg-card hover:bg-primary/5 hover:text-primary transition-colors border-border/80 justify-center"
              onClick={() => {
                const currentPolicy =
                  appConfigs.find(
                    (c) => c.key === AppConfigKey.CANCELLATION_POLICY,
                  )?.value || [];
                handleConfigChange(AppConfigKey.CANCELLATION_POLICY, [
                  ...currentPolicy,
                  { daysBefore: 1, refundPercent: 0 },
                ]);
              }}
            >
              <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Thêm mốc
            </Button>

            <Button
              onClick={() => saveConfig(AppConfigKey.CANCELLATION_POLICY)}
              className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white h-8 sm:h-9 px-3 sm:px-4 rounded-lg text-xs font-semibold cursor-pointer shadow-sm hover:shadow justify-center"
            >
              Lưu chính sách huỷ
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-3.5 sm:p-5 shadow-sm opacity-65 border border-border/60 rounded-2xl bg-card">
        <h2 className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5 sm:mb-3 uppercase tracking-wider">
          Các cấu hình khác (Sắp ra mắt)
        </h2>
        <div className="space-y-4">
          <div className="p-2.5 sm:p-3 bg-transparent rounded-xl border border-dashed border-border/85 flex justify-between items-center">
            <span className="text-[11px] sm:text-xs font-medium text-slate-600 dark:text-slate-300">
              Cấu hình Email Marketing & Mẫu Gửi Tin
            </span>
            <span className="text-[9px] sm:text-[10px] bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-bold">
              Locked
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
