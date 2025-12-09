"use client";

import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

import { RefreshButton } from "../_components/RefreshButton";
import LoyaltyLevelsTab from "./_components/LoyaltyLevelsTab";
import LoyaltyUsersTab from "./_components/LoyaltyUsersTab";

export default function LoyaltyPage() {
  const [tab, setTab] = useState("levels");
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Quản lý khách hàng thân thiết
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý cấp độ và quyền lợi khách hàng.
          </p>
        </div>

        <RefreshButton onRefresh={() => setRefreshKey((k) => k + 1)} />
      </div>

      <Card className="p-6 rounded-2xl shadow-sm">
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full h-12 backdrop-blur-md bg-white/30 border border-white/20 shadow-sm rounded-2xl p-1 mb-6">
            <TabsTrigger
              value="levels"
              className="px-6 data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium transition-all hover:bg-white/20 cursor-pointer"
            >
              Cấp độ
            </TabsTrigger>

            <TabsTrigger
              value="users"
              className="px-6 data-[state=active]:bg-white/80 data-[state=active]:shadow-lg data-[state=active]:backdrop-blur-xl data-[state=active]:text-black bg-white/10 text-gray-700 rounded-xl font-medium transition-all hover:bg-white/20 cursor-pointer"
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
