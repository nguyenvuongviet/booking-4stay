"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User } from "@/types/user";
import { memo, useState } from "react";
import UserBookingsTab from "../tabs/UserBookingsTab";
import UserInfoTab from "../tabs/UserInfoTab";
import UserReviewsTab from "../tabs/UserReviewsTab";

function UserTabsComp({
  user,
  refreshKey,
}: {
  user: User;
  refreshKey: number;
}) {
  const [tab, setTab] = useState("info");

  return (
    <Tabs value={tab} onValueChange={setTab} className="w-full mt-4">
      <TabsList className="grid grid-cols-3 w-full h-12 backdrop-blur-md bg-white/30 border border-white/20 shadow-sm rounded-2xl p-1 mb-5">
        <TabsTrigger
          value="info"
          className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg bg-white/10 text-gray-700 rounded-xl font-medium transition-all cursor-pointer"
        >
          Thông tin
        </TabsTrigger>

        <TabsTrigger
          value="bookings"
          className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg bg-white/10 text-gray-700 rounded-xl font-medium transition-all cursor-pointer"
        >
          Đặt phòng
        </TabsTrigger>

        <TabsTrigger
          value="reviews"
          className="data-[state=active]:bg-white/80 data-[state=active]:shadow-lg bg-white/10 text-gray-700 rounded-xl font-medium transition-all cursor-pointer"
        >
          Đánh giá
        </TabsTrigger>
      </TabsList>

      <TabsContent value="info">
        <UserInfoTab userId={user.id} refreshKey={refreshKey} />
      </TabsContent>

      <TabsContent value="bookings">
        <UserBookingsTab userId={user.id} refreshKey={refreshKey} />
      </TabsContent>

      <TabsContent value="reviews">
        <UserReviewsTab userId={user.id} refreshKey={refreshKey} />
      </TabsContent>
    </Tabs>
  );
}

const UserTabs = memo(UserTabsComp);
export default UserTabs;
