"use client";

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
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);

  const fetchBookings = useCallback(async (pageNumber: number) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await get_booking({ page: pageNumber, pageSize: 3 });      
      const items = res.bookings || [];
      const totalPages = Math.ceil(res.total / 3);

      setBookings((prev) =>
        pageNumber === 1 ? items : [...prev, ...items]
      );
      setHasMore(pageNumber < totalPages);
    } catch (err) {
      console.error("Fetch booking history error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Fetch bookings when bookings tab is selected
  useEffect(() => {
    if (props.activeTab === "bookings" && !bookingsLoaded) {
      fetchBookings(1);
      setBookingsLoaded(true);
    }
  }, [props.activeTab, bookingsLoaded]);

  // Handle pagination
  useEffect(() => {
    if (page > 1) {
      fetchBookings(page);
    }
  }, [page, fetchBookings]);

  // Handle infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (scrollTop + clientHeight >= scrollHeight - 200) {
        setPage((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, loadingMore, hasMore]);


  return (
    <Tabs value={props.activeTab} onValueChange={props.setActiveTab}>
      <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0">
        <TabsTrigger value="profile" className="gap-2 py-3">
          <User className="h-4 w-4" />
          <span className="hidden sm:inline">{t("tab_profile")}</span>
        </TabsTrigger>

        <TabsTrigger value="bookings" className="gap-2 py-3">
          <BookOpen className="h-4 w-4" />
          <span className="hidden sm:inline">{t("tab_bookings")}</span>
        </TabsTrigger>

        <TabsTrigger value="rewards" className="gap-2 py-3">
          <Gift className="h-4 w-4" />
          <span className="hidden sm:inline">{t("tab_rewards")}</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
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
          handleAvatarUpload={props.handleAvatarUpload} />
      </TabsContent>

      <TabsContent value="bookings">
        <BookingTab
          user={props.user}
          bookings={bookings}
          loading={loading}
          loadingMore={loadingMore}
          hasMore={hasMore}
        />
      </TabsContent>

      <TabsContent value="rewards">
        <RewardsTab
          user={props.user}
          bookings={bookings}
          getTierPoints={props.getTierPoints}
        />
      </TabsContent>
    </Tabs>
  );
}
