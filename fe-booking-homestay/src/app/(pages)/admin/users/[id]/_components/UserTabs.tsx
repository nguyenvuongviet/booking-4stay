"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/_components/ui/tabs";
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
    <Tabs value={tab} onValueChange={setTab} className="w-full mt-2">
      <div className="sticky top-16 sm:top-20 z-20 -mx-4 px-4 py-2.5 sm:-mx-6 sm:px-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800 transition-all duration-300">
        <TabsList className="grid grid-cols-3 w-full h-11 sm:h-12.5 bg-slate-100 dark:bg-slate-800/60 p-1 rounded-xl sm:rounded-2xl border border-slate-200/40 dark:border-slate-800 shadow-2xs">
          <TabsTrigger
            value="info"
            className="bg-transparent! data-[state=active]:bg-white! dark:data-[state=active]:bg-slate-900! data-[state=active]:text-primary! text-slate-600 dark:text-slate-350 data-[state=active]:shadow-xs! border border-transparent data-[state=active]:border-slate-200/50! text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer h-full"
          >
            Thông tin
          </TabsTrigger>

          <TabsTrigger
            value="bookings"
            className="bg-transparent! data-[state=active]:bg-white! dark:data-[state=active]:bg-slate-900! data-[state=active]:text-primary! text-slate-600 dark:text-slate-350 data-[state=active]:shadow-xs! border border-transparent data-[state=active]:border-slate-200/50! text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer h-full"
          >
            Đặt phòng
          </TabsTrigger>

          <TabsTrigger
            value="reviews"
            className="bg-transparent! data-[state=active]:bg-white! dark:data-[state=active]:bg-slate-900! data-[state=active]:text-primary! text-slate-600 dark:text-slate-350 data-[state=active]:shadow-xs! border border-transparent data-[state=active]:border-slate-200/50! text-xs sm:text-sm rounded-lg sm:rounded-xl font-semibold transition-all cursor-pointer h-full"
          >
            Đánh giá
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="mt-4">
        <TabsContent value="info">
          <UserInfoTab userId={user.id} refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="bookings">
          <UserBookingsTab userId={user.id} refreshKey={refreshKey} />
        </TabsContent>

        <TabsContent value="reviews">
          <UserReviewsTab userId={user.id} refreshKey={refreshKey} />
        </TabsContent>
      </div>
    </Tabs>
  );
}

const UserTabs = memo(UserTabsComp);
export default UserTabs;
