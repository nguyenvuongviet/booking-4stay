"use client";

import { Lock, Settings, User } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import AccountTab from "./_components/AccountTab";
import NotificationsTab from "./_components/NotificationsTab";
import SecurityTab from "./_components/SecurityTab";
import SystemConfigTab from "./_components/SystemConfigTab";

function SettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "account");

  useEffect(() => {
    if (
      tabParam &&
      ["account", "security", "system", "notifications"].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/admin/settings?tab=${tabId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-3xl font-bold tracking-tight">
          Cài đặt hệ thống
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">
          Quản lý tài khoản admin, cấu hình vận hành và các thiết lập khác.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 lg:gap-8 mt-3 lg:mt-8">
        {/* Settings Sidebar */}
        <div className="w-full lg:w-64 shrink-0 flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 border-b lg:border-b-0 lg:border-r border-border/80">
          {[
            {
              id: "account",
              label: "Tài khoản",
              description: "Hồ sơ cá nhân của bạn",
              icon: User,
            },
            {
              id: "security",
              label: "Bảo mật",
              description: "Mật khẩu và bảo mật",
              icon: Lock,
            },
            {
              id: "system",
              label: "Cấu hình hệ thống",
              description: "Cấu hình chính sách & vận hành",
              icon: Settings,
            },
            // {
            //   id: "notifications",
            //   label: "Thông báo",
            //   description: "Quản lý nhận tin thông báo",
            //   icon: Bell,
            // },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex flex-row lg:flex-col items-center lg:items-start text-left px-3.5 py-2 lg:px-4 lg:py-3 rounded-lg lg:rounded-xl transition-all cursor-pointer w-auto lg:w-full shrink-0 whitespace-nowrap group ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <Icon
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? "text-primary" : "text-slate-400 group-hover:text-primary"}`}
                  />
                  <span>{tab.label}</span>
                </div>
                <span className="hidden lg:block text-[11px] text-muted-foreground mt-0.5 font-normal">
                  {tab.description}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="flex-1 min-w-0">
          {activeTab === "account" && <AccountTab />}
          {activeTab === "security" && <SecurityTab />}
          {activeTab === "system" && <SystemConfigTab />}
          {activeTab === "notifications" && <NotificationsTab />}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-100 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SettingsContent />
    </Suspense>
  );
}
