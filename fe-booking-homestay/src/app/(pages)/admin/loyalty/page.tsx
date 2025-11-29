"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "./_components/dashboard-header";
import LoyaltyLevelsTab from "./_components/loyalty-level-tab";
import UserLoyaltyTab from "./_components/user-loyalty-tab";
import AdminControlsTab from "./_components/controls-tab";

export default function LoyaltyPage() {
  const [activeTab, setActiveTab] = useState<"levels" | "users" | "admin">(
    "levels"
  );

  const tabs = [
    { id: "levels", label: "Loyalty Levels" },
    { id: "users", label: "User Loyalty" },
  ];
  

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <AdminControlsTab />
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-8 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-in fade-in-50 duration-300">
          {activeTab === "levels" && <LoyaltyLevelsTab />}
          {activeTab === "users" && <UserLoyaltyTab  />}
        </div>
      </div>
    </div>
  );
}
