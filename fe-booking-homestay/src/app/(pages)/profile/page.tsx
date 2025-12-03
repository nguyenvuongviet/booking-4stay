"use client";

import { BookingCard } from "@/components/bookings/BookingCard";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import Headers from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { COUNTRIES } from "@/constants/countries";
import { useAuth } from "@/context/auth-context";
import { Booking, BookingStatus } from "@/models/Booking";
import { IUser } from "@/models/User";
import { update_profile, upload_file } from "@/services/authApi";
import { get_booking } from "@/services/bookingApi";
import { format } from "date-fns";
import { get } from "http";
import {
  BookOpen,
  Calendar,
  CalendarX,
  DollarSign,
  Edit2,
  Gift,
  Loader2,
  Save,
  TrendingUp,
  Upload,
  User,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import DatePicker from "react-datepicker";
import toast from "react-hot-toast";

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Update profile failed!");
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
      console.log("Upload avatar thành công!");
    } catch (error) {
      toast.error("Upload avatar failed!");
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

  return (
    <div className="min-h-screen bg-background">
      <Headers />
      <main className="min-h-screen p-4 md:p-8 mt-18">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 rounded-2xl bg-secondary/60 p-4 px-8 shadow-lg">
            <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-6">
                <img
                  className="h-28 w-28 object-cover rounded-full"
                  src={avatarUrl}
                  alt="avatar"
                />
                <div>
                  <h1 className="text-2xl elegant-sans">
                    {firstName} {lastName}
                  </h1>
                  <p className="text-muted-foreground text-sm">{email}</p>
                  <p className="text-muted-foreground text-sm">{phone}</p>

                  <p className="text-muted text-sm">
                    Member since{" "}
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-GB")
                      : "-"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 grid-row-1">
                <div className="grid grid-cols-3 gap-4 w-full md:w-auto">
                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <p className="text-sm pb-2">Total Bookings</p>
                    <p className="text-lg elegant-sans">
                      {user?.loyalty_program.totalBooking || 0}
                    </p>
                  </div>

                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <p className="text-sm pb-2">Loyalty Points</p>
                    <p className="text-lg elegant-sans">
                      {user?.loyalty_program.totalPoint || 0}
                    </p>
                  </div>

                  <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <p className="text-sm pb-2 ">Loyalty Level</p>
                    <p className="text-lg elegant-sans">
                      {user?.loyalty_program.levels.name || "_"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 gap-2 bg-transparent p-0 md:gap-4">
              <TabsTrigger
                value="profile"
                className="rounded-lg shadow-sm transition-all gap-2 py-3"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">My profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="rounded-lg shadow-sm transition-all gap-2 py-3"
              >
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">My Bookings</span>
              </TabsTrigger>
              <TabsTrigger
                value="rewards"
                className="rounded-lg shadow-sm transition-all gap-2 py-3"
              >
                <Gift className="h-5 w-5" />
                <span className="hidden sm:inline">Rewards</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent
              value="profile"
              className="mt-2 px-16 py-8 rounded-xl space-y-4 bg-card "
            >
              <div className="flex justify-between mb-8">
                <h1 className="text-4xl elegant-heading mb-4">My profile</h1>
                <Button
                  onClick={isEditing ? handleSubmit : handleEditClick}
                  className="gap-2 rounded-lg"
                  variant={isEditing ? "default" : "secondary"}
                >
                  {isEditing ? (
                    <Save className="h-4 w-4" />
                  ) : (
                    <Edit2 className="h-4 w-4" />
                  )}
                  {isEditing ? "Save" : "Edit"}
                </Button>
              </div>
              {/* Profile Avatar */}
              <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                {/* Avatar */}
                <div className="w-full md:w-1/3 flex justify-center items-center">
                  <div className="relative w-48 h-48 rounded-full overflow-hidden group">
                    <img
                      className="w-full h-full object-cover"
                      src={avatarUrl}
                      alt="avatar"
                    />
                    {isEditing && (
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="text-white h-6 w-6 mb-1" />
                        <span className="text-xs text-white">Upload</span>
                      </div>
                    )}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Form Fields */}
                {user ? (
                  <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="elegant-subheading">
                        First Name
                      </Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="bg-input rounded-xl"
                        readOnly={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="elegant-subheading">
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="bg-input rounded-xl"
                        readOnly={!isEditing}
                      />
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="email" className="elegant-subheading">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        readOnly
                        className="bg-input rounded-xl text-muted-foreground"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="elegant-subheading">
                        Phone Number
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        readOnly
                        className="bg-input rounded-xl text-muted-foreground"
                      />
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-2">
                      <Label htmlFor="dob" className="elegant-subheading">
                        Date of Birth
                      </Label>
                      <div className="relative w-full">
                        <DatePicker
                          id="dob"
                          selected={dob}
                          onChange={(date) => setDob(date)}
                          dateFormat="dd/MM/yyyy"
                          className={`w-full rounded-xl border border-input bg-input px-3 py-2 text-sm shadow-xs outline-none ${
                            !isEditing ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                          maxDate={new Date()}
                          disabled={!isEditing}
                        />
                        <Calendar
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                          size={20}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gender" className="elegant-subheading">
                        Gender
                      </Label>
                      <Select
                        value={gender}
                        onValueChange={setGender}
                        disabled={!isEditing}
                      >
                        <SelectTrigger
                          className={`w-full bg-input rounded-xl placeholder:text-muted ${
                            !isEditing ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                        >
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="elegant-subheading">
                        Country
                      </Label>
                      <Select
                        value={country}
                        onValueChange={setCountry}
                        disabled={!isEditing}
                      >
                        <SelectTrigger
                          className={`w-full bg-input rounded-xl placeholder:text-muted ${
                            !isEditing ? "opacity-70 cursor-not-allowed" : ""
                          }`}
                        >
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-auto">
                          {COUNTRIES.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <p className="text-center text-gray-500">
                    No user info found.
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent
              value="bookings"
              className="mt-2 px-16 py-8 rounded-xl space-y-4 bg-card "
            >
              <h2 className="elegant-heading text-4xl my-6">History booking</h2>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-sm">Loading your bookings...</span>
                  </div>
                </div>
              ) : user?.loyalty_program.totalBooking === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground ">
                  <CalendarX className="h-12 w-12 mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No bookings yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    When you make a booking, it will appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 mt-2 p-8 rounded-xl space-y-4">
                  {bookings.map((booking, index) => (
                    <BookingCard
                      key={`${booking.id}-${index}`}
                      booking={booking}
                    />
                  ))}
                  {loadingMore && (
                    <div className="flex items-center justify-center py-6">
                      <div className="flex items-center gap-3 text-muted">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm">Loading more hotels...</span>
                      </div>
                    </div>
                  )}

                  {!hasMore && !loadingMore && bookings.length > 0 && (
                    <div className="flex items-center justify-center py-2">
                      <div className="text-center text-muted">
                        <p className="text-sm ">
                          You{"'"}ve reached the end of the results
                        </p>
                        <p className="text-xs mt-1">
                          Total: {bookings.length} hotels found
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent
              value="rewards"
              className="mt-2 px-16 py-8 rounded-xl space-y-4 bg-card "
            >
              <h2 className="text-3xl elegant-sans">My Rewards</h2>

              {/* Rewards Stats Cards */}
              <div className="grid gap-6 md:grid-cols-3">
                <Card className="border-0 p-8 shadow-md hover:shadow-xl transition-all bg-accent/50 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-linear-to-br from-accent to-primary/90 rounded-xl group-hover:scale-110 transition-transform">
                      <Gift className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="elegant-sans text-muted-foreground text-sm">
                        Total Points
                      </h3>
                      <p className="mt-3 text-4xl elegant-sans text-secondary-foreground">
                        {user?.loyalty_program.totalPoint || 0}
                      </p>
                      <p className="mt-2 text-xs text-muted">Points earned</p>
                    </div>
                  </div>
                </Card>

                <Card className="border-0 p-8 shadow-md hover:shadow-xl transition-all bg-linear-to-br from-orange-50 to-red-50 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-linear-to-br from-secondary to-secondary/50 rounded-xl group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-6 w-6 text-orange-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="elegant-sans text-muted-foreground text-sm">
                        Tier Points
                      </h3>
                      <p className="mt-3 text-4xl elegant-sans text-orange-700">
                        {getTierPoints(user?.loyalty_program.totalPoint || 0)}
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        Towards next tier
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="border-0 p-8 shadow-md hover:shadow-xl transition-all bg-linear-to-br from-green-50 to-emerald-50 group cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-linear-to-br from-green-100 to-emerald-200 rounded-xl group-hover:scale-110 transition-transform">
                      <DollarSign className="h-6 w-6 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="elegant-sans text-muted-foreground text-sm">
                        Cashback
                      </h3>
                      <p className="mt-3 text-4xl elegant-sans text-green-700">
                        0 đ
                      </p>
                      <p className="mt-2 text-xs text-muted">
                        Available to redeem
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Rewards History Table */}
              <div className="mt-10">
                <h3 className="text-2xl elegant-sans mb-6">Points History</h3>
                <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-md">
                  <div className="overflow-x-auto">
                    {user?.loyalty_program.totalBooking === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground ">
                        <CalendarX className="h-12 w-12 mb-4 text-gray-400" />
                        <p className="text-lg font-medium">No bookings yet</p>
                      </div>
                    ) : (
                      <table className="w-full">
                        <thead className="bg-linear-to-r from-slate-100 to-slate-50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm elegant-sans">
                              Date
                            </th>
                            <th className="px-6 py-4 text-left text-sm elegant-sans">
                              Description
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-semibold">
                              Points
                            </th>
                            <th className="px-6 py-4 text-left text-sm elegant-sans">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {bookings.map((record) => (
                            <tr
                              key={record.id}
                              className="hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {format(record.createdAt, "dd/MM/yyyy")}
                                {/* {format(record.checkIn, "dd/MM/yyyy")} - {format(record.checkOut, "dd/MM/yyyy")} */}
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground elegant-sans">
                                {record.room?.name}
                              </td>
                              <td className="px-6 py-4 text-sm elegant-sans">
                                <span
                                  className={`${
                                    record.totalAmount / 1000 > 0
                                      ? "text-blue-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {record.totalAmount / 1000 > 0 ? "+" : ""}
                                  {record.totalAmount / 1000}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm">
                                <BookingStatusBadge
                                  status={record.status as BookingStatus}
                                />
                                {/* <span
                                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                  record.status === "completed"
                                    ? "bg-green-100 text-green-700"
                                    : record.status === "pending"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${
                                    record.status === "completed"
                                      ? "bg-green-600"
                                      : record.status === "pending"
                                      ? "bg-yellow-600"
                                      : "bg-red-600"
                                  }`}
                                ></span>
                                {record.status.charAt(0).toUpperCase() +
                                  record.status.slice(1)}
                              </span> */}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
