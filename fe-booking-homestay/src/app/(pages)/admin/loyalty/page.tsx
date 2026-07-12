"use client";

import { Card } from "@/_components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/_components/ui/tabs";
import { useEffect, useState } from "react";
import { RefreshButton } from "../_components/RefreshButton";
import LoyaltyLevelsTab from "./_components/LoyaltyLevelsTab";
import LoyaltyUsersTab from "./_components/LoyaltyUsersTab";

export default function LoyaltyPage() {
  const [tab, setTab] = useState("levels");
  const [refreshKey, setRefreshKey] = useState(0);

  const [progress, setProgress] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

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
          setRefreshKey((k) => k + 1);
          return 0;
        }
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled]);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 sm:pb-4 border-b gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Quản lý khách hàng thân thiết
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mt-0.5 sm:mt-1">
            Quản lý cấp độ và quyền lợi khách hàng.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <div
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`flex items-center gap-2 text-[11px] font-bold px-2.5 py-1.5 rounded-xl border select-none cursor-pointer transition-all ${
              autoRefreshEnabled
                ? "bg-slate-50 dark:bg-slate-850 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-100"
                : "bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 hover:bg-slate-200"
            }`}
            title={
              autoRefreshEnabled
                ? "Click để tạm dừng tự động làm mới"
                : "Click để bật tự động làm mới"
            }
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

          <RefreshButton
            onRefresh={async () => {
              setRefreshKey((k) => k + 1);
              setProgress(0);
            }}
          />
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

      <Card className="p-3.5 sm:p-6 rounded-2xl shadow-sm">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-10 sm:h-12 backdrop-blur-md bg-white/30 border border-white/20 shadow-sm rounded-2xl p-0.5 sm:p-1 mb-4 sm:mb-6">
            <TabsTrigger
              value="levels"
              className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium transition-all hover:bg-white/20 cursor-pointer"
            >
              Cấp độ
            </TabsTrigger>

            <TabsTrigger
              value="users"
              className="px-4 sm:px-6 py-1.5 sm:py-2 text-xs sm:text-sm data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium transition-all hover:bg-white/20 cursor-pointer"
            >
              Người dùng
            </TabsTrigger>
          </TabsList>

          <TabsContent value="levels">
            <LoyaltyLevelsTab refreshKey={refreshKey} />
          </TabsContent>

          <TabsContent value="users">
            <LoyaltyUsersTab refreshKey={refreshKey} />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
