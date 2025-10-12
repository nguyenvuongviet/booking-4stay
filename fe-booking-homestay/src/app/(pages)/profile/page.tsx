"use client";

import { useState, useRef, useEffect } from "react";
import Headers from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth-context";
import { update_profile, upload_file } from "@/services/authApi";
import { IUser } from "@/models/User";
import { COUNTRIES } from "@/constants/countries";

export default function ProfilePage() {
  const { user, setUser, updateUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  // state local để edit
  const [avatarUrl, setAvatarUrl] = useState("/default-avatar.jpg");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // mỗi khi user thay đổi (từ context), sync vào state form
  useEffect(() => {
    if (user) {
      setAvatarUrl(user.avatar || "/default-avatar.jpg");
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setDob(user.dateOfBirth ? user.dateOfBirth.split("T")[0] : "");
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
      if (!res?.data) {
        console.error("User data undefined, cannot update localStorage");
        return;
      }

      // setUser(res.data);
      updateUser({
        ...res.data, // dữ liệu mới từ API
        avatar: user.avatar, // giữ avatar đang có
      });
      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Có lỗi khi cập nhật!");
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

      // gọi API upload avatar
      const { data } = await upload_file(formData);
      // giả sử res.data.avatar là URL mới của avatar
      if (data?.imgUrl) {
        setAvatarUrl(data.imgUrl);

        // update user trong context và localStorage
        updateUser({ ...user, avatar: data.imgUrl });
      }

      console.log("Upload avatar thành công!");
    } catch (error) {
      console.error("Upload avatar error:", error);
      alert("Có lỗi khi upload avatar!");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Headers />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto mt-24">
        <h1 className="text-3xl elegant-heading  mb-4">
          My profile
        </h1>
        {/* Profile Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="relative w-32 h-32 mb-2 rounded-full overflow-hidden">
                <img
                  className="w-full h-full object-cover"
                  src={avatarUrl}
                  alt="avatar"
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer bg-black bg-opacity-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="text-white text-sm font-medium">Upload</span>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <p className="text-sm text-gray-600">{email}</p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        {user ? (
          <div className="space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-[#292d32] font-medium"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-[#f9fafb] border-[#e5e5e5] text-[#292d32]"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-[#292d32] font-medium"
                >
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-[#f9fafb] border-[#e5e5e5] text-[#292d32]"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[#292d32] font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                readOnly
                className="bg-[#f9fafb] border-[#e5e5e5] text-[#777]"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#292d32] font-medium">
                Phone Number
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                className="bg-[#f9fafb] border-[#e5e5e5] text-[#666]"
                readOnly
              />
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label htmlFor="dob" className="text-[#292d32] font-medium">
                Date of birth
              </Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="bg-[#f9fafb] border-[#e5e5e5] text-[#292d32]"
              />
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label htmlFor="gender" className="text-[#292d32] font-medium">
                Gender
              </Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="w-full bg-[#f9fafb] border-[#e5e5e5] text-[#292d32]">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Country */}
            <div className="space-y-2">
              <Label htmlFor="country" className="text-[#292d32] font-medium">
                Country
              </Label>
              <Select value={country} onValueChange={setCountry}>
                <SelectTrigger className="w-full bg-[#f9fafb] border-[#e5e5e5] text-[#292d32]">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              className="my-4 rounded-2xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 elegant-subheading text-md"
            >
              Save change
            </Button>
          </div>
        ) : (
          <p className="text-center text-gray-500">No user info found.</p>
        )}
      </div>
    </div>
  );
}
