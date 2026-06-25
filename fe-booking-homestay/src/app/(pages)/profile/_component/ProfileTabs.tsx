"use client";

import { Badge } from "@/_components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/_components/ui/tabs";
import { getTierColorClass } from "@/_helper/tier.helper";
import { useLang } from "@/context/lang-context";
import { IUser } from "@/models/User";
import { BookOpen, Gift, Heart, Ticket, Upload, User } from "lucide-react";
import { RefObject, useEffect } from "react";
import BookingTab from "./BookingTab";
import FavoritesTab from "./FavoritesTab";
import ProfileTab from "./ProfileTab";
import RewardsTab from "./RewardsTab";
import VoucherWallet from "./VoucherWallet";

interface Props {
  user: IUser | null;
  activeTab: string;
  setActiveTab: (value: string) => void;
  isEditing: boolean;
  handleEditClick: () => void;
  handleSubmit: () => void;
  avatarUrl: string;
  fileInputRef: RefObject<HTMLInputElement>;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  email: string;
  phone: string;
  dob: Date | null;
  setDob: (d: Date | null) => void;
  gender: string;
  setGender: (v: string) => void;
  country: string;
  setCountry: (v: string) => void;
}

export default function ProfileTabs(props: Props) {
  const { t } = useLang();

  const levelColor = (level: string) => {
    return `${getTierColorClass(level, "full")} gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-wider`;
  };
  // Auto-scroll active tab into view on mobile horizontal tab lists
  useEffect(() => {
    const activeEl = document.getElementById(`tab-trigger-${props.activeTab}`);
    if (activeEl) {
      const parent = activeEl.parentElement;
      if (parent) {
        let scrollLeft =
          activeEl.offsetLeft - (parent.clientWidth - activeEl.clientWidth) / 2;

        // Safety check: never scroll past the left edge of the active tab
        if (scrollLeft > activeEl.offsetLeft) {
          scrollLeft = activeEl.offsetLeft;
        }

        parent.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [props.activeTab]);

  return (
    <Tabs
      value={props.activeTab}
      onValueChange={props.setActiveTab}
      className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start"
    >
      {/* Sidebar */}
      <div className="col-span-1 md:col-span-4 lg:col-span-3 md:sticky md:top-24 self-start w-full min-w-0">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-md md:shadow-xl md:sticky md:top-24 animate-in fade-in slide-in-from-left-4 duration-500 w-full min-w-0">
          {/* User Profile Info */}
          <div className="flex flex-row md:flex-col items-center md:text-center text-left gap-4 md:gap-0 mb-5 md:mb-8 pb-4 md:pb-0 border-b border-slate-100 dark:border-slate-800 md:border-b-0">
            <div className="relative w-16 h-16 md:w-28 md:h-28 rounded-full border-2 md:border-4 border-slate-50 dark:border-slate-800 shadow-sm md:mb-4 bg-white shrink-0 group overflow-hidden transition-all duration-300">
              <img
                src={
                  props.avatarUrl || props.user?.avatar || "/default-avatar.png"
                }
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
              <div
                className="absolute inset-0 flex flex-col items-center justify-center bg-black/65 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-xs rounded-full"
                onClick={() => props.fileInputRef.current?.click()}
              >
                <Upload className="text-white h-4 w-4 md:h-6 md:w-6 mb-0.5 md:mb-1 animate-bounce" />
                <span className="text-[8px] md:text-[10px] font-bold text-white tracking-wider uppercase text-center px-1">
                  {t("upload")}
                </span>
              </div>
            </div>
            <input
              ref={props.fileInputRef}
              type="file"
              accept="image/*"
              onChange={props.handleAvatarUpload}
              className="hidden"
            />
            <div className="flex-1 flex flex-col items-start md:items-center min-w-0">
              <h3 className="font-bold text-lg md:text-xl tracking-tight text-slate-900 dark:text-white truncate w-full">
                {props.user?.firstName} {props.user?.lastName}
              </h3>
              <p className="text-slate-500 text-xs md:text-sm mt-0.5 md:mt-1 truncate w-full">
                {props.user?.email}
              </p>
              <div className="mt-2 md:mt-4 inline-flex items-center">
                <Badge
                  className={levelColor(
                    props.user?.loyalty_program.levels.name || "",
                  )}
                >
                  {props.user?.loyalty_program?.levels?.name}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <TabsList className="flex flex-row md:flex-col w-full! h-auto bg-transparent p-0 gap-1.5 justify-start overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:overflow-visible md:space-y-2 pb-1 md:pb-0">
            <TabsTrigger
              id="tab-trigger-profile"
              value="profile"
              className="flex-none w-auto md:w-full shrink-0 justify-start gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:py-2 sm:px-3.5 md:py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold text-xs sm:text-sm transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <User className="h-4 w-4 md:h-5 md:w-5" />
              <span>{t("tab_profile")}</span>
            </TabsTrigger>

            <TabsTrigger
              id="tab-trigger-bookings"
              value="bookings"
              className="flex-none w-auto md:w-full shrink-0 justify-start gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:py-2 sm:px-3.5 md:py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold text-xs sm:text-sm transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
              <span>{t("tab_bookings")}</span>
            </TabsTrigger>

            <TabsTrigger
              id="tab-trigger-rewards"
              value="rewards"
              className="flex-none w-auto md:w-full shrink-0 justify-start gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:py-2 sm:px-3.5 md:py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold text-xs sm:text-sm transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Gift className="h-4 w-4 md:h-5 md:w-5" />
              <span>{t("tab_rewards")}</span>
            </TabsTrigger>

            <TabsTrigger
              id="tab-trigger-favorites"
              value="favorites"
              className="flex-none w-auto md:w-full shrink-0 justify-start gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:py-2 sm:px-3.5 md:py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold text-xs sm:text-sm transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Heart className="h-4 w-4 md:h-5 md:w-5" />
              <span>Yêu thích</span>
            </TabsTrigger>
            <TabsTrigger
              id="tab-trigger-vouchers"
              value="vouchers"
              className="flex-none w-auto md:w-full shrink-0 justify-start gap-1.5 sm:gap-2 py-1.5 px-2.5 sm:py-2 sm:px-3.5 md:py-3 rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-semibold text-xs sm:text-sm transition-all text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Ticket className="h-4 w-4 md:h-5 md:w-5" />
              <span>Ví Voucher</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-1 md:col-span-8 lg:col-span-9 space-y-6 w-full">
        <TabsContent value="profile" className="m-0 focus-visible:outline-none">
          <ProfileTab
            user={props.user}
            isEditing={props.isEditing}
            firstName={props.firstName}
            setFirstName={props.setFirstName}
            lastName={props.lastName}
            setLastName={props.setLastName}
            email={props.email}
            phone={props.phone}
            dob={props.dob}
            setDob={props.setDob}
            gender={props.gender}
            setGender={props.setGender}
            country={props.country}
            setCountry={props.setCountry}
            handleSubmit={props.handleSubmit}
            handleEditClick={props.handleEditClick}
          />
        </TabsContent>

        <TabsContent
          value="bookings"
          className="m-0 focus-visible:outline-none"
        >
          <BookingTab
            user={props.user}
            isActive={props.activeTab === "bookings"}
          />
        </TabsContent>

        <TabsContent value="rewards" className="m-0 focus-visible:outline-none">
          <RewardsTab
            user={props.user}
            isActive={props.activeTab === "rewards"}
          />
        </TabsContent>

        <TabsContent
          value="favorites"
          className="m-0 focus-visible:outline-none"
        >
          <FavoritesTab />
        </TabsContent>
        <TabsContent
          value="vouchers"
          className="m-0 focus-visible:outline-none"
        >
          <VoucherWallet />
        </TabsContent>
      </div>
    </Tabs>
  );
}
