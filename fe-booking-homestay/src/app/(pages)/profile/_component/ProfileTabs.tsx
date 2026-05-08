"use client";

import { Badge } from "@/_components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/_components/ui/tabs";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { IUser } from "@/models/User";
import { get_booking } from "@/services/bookingApi";
import { BookOpen, Gift, User } from "lucide-react";
import { RefObject, useCallback, useEffect, useState } from "react";
import BookingTab from "./BookingTab";
import ProfileTab from "./ProfileTab";
import RewardsTab from "./RewardsTab";

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
  getTierPoints: (point: number) => number;
}

export default function ProfileTabs(props: Props) {
  const { t } = useLang();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const levelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "BRONZE":
        return "bg-amber-100/60 text-amber-800 gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-wider";
      case "SILVER":
        return "bg-gray-200/60 text-gray-700 gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-wider";
      case "GOLD":
        return "bg-yellow-200/60 text-yellow-800 gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-wider";
      case "PLATINUM":
        return "bg-blue-200/60 text-blue-800 gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-wider";
      case "DIAMOND":
        return "bg-sky-300/60 text-sky-900 gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-wider";
      default:
        return "bg-gray-100/60 text-gray-700 gap-1.5 px-3 py-1.5 rounded-full uppercase tracking-wider";
    }
  };

  const fetchBookings = useCallback(async (pageNumber: number) => {
    setLoading(true);

    try {
      const res = await get_booking({ page: pageNumber, pageSize: 3 });
      const items = res.bookings || [];
      const calculatedTotalPages = Math.ceil(res.total / 3);

      setBookings(items);
      setTotalPages(calculatedTotalPages);
      setHasMore(pageNumber < calculatedTotalPages);
    } catch (err) {
      console.error("Fetch booking history error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch bookings when tab is selected or page changes
  useEffect(() => {
    if (props.activeTab === "bookings") {
      fetchBookings(page);
    }
  }, [props.activeTab, page, fetchBookings]);

  return (
    <Tabs
      value={props.activeTab}
      onValueChange={props.setActiveTab}
      className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start"
    >
      {/* Sidebar */}
      <div className="md:col-span-4 lg:col-span-3 sticky top-24 self-start">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-border dark:border-slate-800 shadow-xl sticky top-24 animate-in fade-in slide-in-from-left-4 duration-500">
          {/* User Profile Info */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative w-28 h-28 rounded-full border-4 border-border dark:border-slate-800 shadow-md mb-4 bg-white">
              <img
                src={
                  props.avatarUrl || props.user?.avatar || "/default-avatar.png"
                }
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <h3 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
              {props.user?.firstName} {props.user?.lastName}
            </h3>
            <p className="text-slate-500 text-sm mt-1">{props.user?.email}</p>
            <div className="mt-4 inline-flex items-center">
              <Badge
                className={levelColor(
                  props.user?.loyalty_program.levels.name || "",
                )}
              >
                {props.user?.loyalty_program?.levels?.name}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <TabsList className="flex flex-col w-full h-auto bg-transparent p-0 space-y-2">
            <TabsTrigger
              value="profile"
              className="w-full justify-start gap-3 py-3 px-4 rounded-xl data-[state=active]:bg-primary/50 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium transition-all text-muted-foreground dark:text-slate-400 hover:bg-accent/40 dark:hover:bg-slate-800/50"
            >
              <User className="h-5 w-5" />
              <span>{t("tab_profile")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="bookings"
              className="w-full justify-start gap-3 py-3 px-4 rounded-xl data-[state=active]:bg-primary/50 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium transition-all text-muted-foreground dark:text-slate-400 hover:bg-accent/40 dark:hover:bg-slate-800/50"
            >
              <BookOpen className="h-5 w-5" />
              <span>{t("tab_bookings")}</span>
            </TabsTrigger>

            <TabsTrigger
              value="rewards"
              className="w-full justify-start gap-3 py-3 px-4 rounded-xl data-[state=active]:bg-primary/50 data-[state=active]:text-primary-foreground data-[state=active]:shadow-md font-medium transition-all text-muted-foreground dark:text-slate-400 hover:bg-accent/40 dark:hover:bg-slate-800/50"
            >
              <Gift className="h-5 w-5" />
              <span>{t("tab_rewards")}</span>
            </TabsTrigger>
          </TabsList>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:col-span-8 lg:col-span-9 space-y-6">
        <TabsContent value="profile" className="m-0 focus-visible:outline-none">
          <ProfileTab
            user={props.user}
            isEditing={props.isEditing}
            avatarUrl={props.avatarUrl}
            fileInputRef={props.fileInputRef}
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
            handleAvatarUpload={props.handleAvatarUpload}
          />
        </TabsContent>

        <TabsContent
          value="bookings"
          className="m-0 focus-visible:outline-none"
        >
          <BookingTab
            user={props.user}
            bookings={bookings}
            loading={loading}
            page={page}
            setPage={setPage}
            totalPages={totalPages}
          />
        </TabsContent>

        <TabsContent value="rewards" className="m-0 focus-visible:outline-none">
          <RewardsTab
            user={props.user}
            bookings={bookings}
            getTierPoints={props.getTierPoints}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}
