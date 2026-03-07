"use client";

import Headers from "@/_components/Header";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { IUser } from "@/models/User";
import { update_profile, upload_file } from "@/services/authApi";
import { get_booking } from "@/services/bookingApi";
import { useEffect, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import toast from "react-hot-toast";
import ProfileHeader from "./_component/ProfileHeader";
import ProfileTabs from "./_component/ProfileTabs";

export default function ProfilePage() {
  const { t } = useLang();
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.png");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState<Date | null>(null);
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const getTierPoints = (total: number) => {
    if (total < 1000) return 1000 - total;
    if (total < 2000) return 2000 - total;
    return 0;
  };

  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar || "/default-avatar.png");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setDob(user.dateOfBirth ? new Date(user.dateOfBirth) : null);
      setGender(user.gender || "");
      setCountry(user.country || "");
      setEmail(user.email || "");
      setPhone(user.phoneNumber || "");
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!user) return;
    try {
      const updatedUser: Partial<IUser> = Object.fromEntries(
        Object.entries({
          firstName,
          lastName,
          phoneNumber: phone,
          country,
          dateOfBirth: dob ? new Date(dob).toISOString() : undefined,
          gender,
        }).filter(([_, v]) => v && v !== "")
      );

      const res = await update_profile(updatedUser);
      if (!res?.data) return;

      updateUser({
        ...res.data,
        avatar: user.avatar,
      });
      toast.success(t("profile_updated_success"));
      setIsEditing(false);
    } catch (error) {
      toast.error(t("profile_update_failed"));
      console.error(error);
    }
  };

  const handleAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const url = URL.createObjectURL(file);
    setAvatarUrl(url);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const { data } = await upload_file(formData);
      if (data?.imgUrl) {
        setAvatarUrl(data.imgUrl);
        updateUser({ ...user, avatar: data.imgUrl });
      }
      setIsEditing(false);
      console.log(t("avatar_upload_success"));
    } catch (error) {
      toast.error(t("avatar_upload_failed"));
      console.error("Upload avatar error:", error);
    }
  };

  const handleEditClick = () => setIsEditing(true);

  const fetchBookings = async (pageNumber: number) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const res = await get_booking({ page: pageNumber, pageSize: 3 });
      const items = res.bookings || [];
      const totalPages = Math.ceil(res.total / 3);

      setBookings((prev) => (pageNumber === 1 ? items : [...prev, ...items]));
      setHasMore(pageNumber < totalPages);
    } catch (err) {
      console.error("Fetch booking history error:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchBookings(page);
  }, [page]);

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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Headers />
      <main className="min-h-screen p-4 md:p-8 mt-18">
        <div className="mx-auto max-w-5xl">
          <ProfileHeader user={user as IUser} />
          <ProfileTabs
            user={user}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isEditing={isEditing}
            avatarUrl={avatarUrl}
            fileInputRef={fileInputRef as React.RefObject<HTMLInputElement>}
            firstName={firstName}
            setFirstName={setFirstName}
            lastName={lastName}
            setLastName={setLastName}
            email={email}
            phone={phone}
            dob={dob}
            setDob={setDob}
            gender={gender}
            setGender={setGender}
            country={country}
            setCountry={setCountry}
            handleSubmit={handleSubmit}
            handleEditClick={handleEditClick}
            handleAvatarUpload={handleAvatarUpload}
            bookings={bookings}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            getTierPoints={getTierPoints}
          />
        </div>
      </main>
    </div>
  );
}
