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
import { BookOpen, Gift, User } from "lucide-react";
import { RefObject } from "react";
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
  setCountry: (v: string) => void; bookings: Booking[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  getTierPoints: (point: number) => number;
}

export default function ProfileTabs(props: Props) {
  const { t } = useLang();

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
          bookings={props.bookings}
          loading={props.loading}
          loadingMore={props.loadingMore}
          hasMore={props.hasMore}
        />
      </TabsContent>

      <TabsContent value="rewards">
        <RewardsTab
          user={props.user}
          bookings={props.bookings}
          getTierPoints={props.getTierPoints}
        />
      </TabsContent>
    </Tabs>
  );
}
