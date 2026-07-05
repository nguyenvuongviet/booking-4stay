"use client";

import { Card } from "@/_components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/_components/ui/tabs";
import { useState } from "react";
import { RefreshButton } from "../_components/RefreshButton";
import LoyaltyLevelsTab from "./_components/LoyaltyLevelsTab";
import LoyaltyUsersTab from "./_components/LoyaltyUsersTab";

export default function LoyaltyPage() {
  const [tab, setTab] = useState("levels");
  const [refreshKey, setRefreshKey] = useState(0);

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

        <div className="shrink-0">
          <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
        </div>
      </div>

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
