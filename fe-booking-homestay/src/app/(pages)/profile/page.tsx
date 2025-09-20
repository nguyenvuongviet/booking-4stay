"use client";

import { useAuth } from "@/context/auth-context";
import { useState, useRef } from "react";
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

export default function ProfilePage() {
  const {user} = useAuth();
  const handleSubmit = () => {
    // updateUser({ fullName, phone });
    alert("Cập nhật thành công!");
  };

  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || "/images/default-avatar.jpg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <Headers />

      <div className="max-w-2xl mx-auto px-6 py-6">
        {/* Profile Avatar */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div
              className="w-32 h-32 shadow-md rounded-full overflow-hidden "
            >
              <img
                src={avatarUrl}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div
              className="absolute inset-0  rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <span className="text-black text-sm font-medium">Upload</span>
            </div>
            <input
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
        <div className="space-y-4">
          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-[#292d32] font-medium">
                First Name
              </Label>
              <Input
                id="firstName"
                value={user.fullName}
                className="bg-[#f9fafb] border-[#e5e5e5] text-[#292d32]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-[#292d32] font-medium">
                Last Name
              </Label>
              <Input
                id="lastName"
                value="Ly"
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
              value={user.email}
              className="bg-[#f9fafb] border-[#e5e5e5] text-[#777]"
              readOnly
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
              value={user.phoneNumber}
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
              value={user.dateOfBirth}
              className="bg-[#f9fafb] border-[#e5e5e5] text-[#292d32]"
            />
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender" className="text-[#292d32] font-medium">
              Gender
            </Label>
            <Select>
              <SelectTrigger className="w-full bg-[#f9fafb] border-[#e5e5e5] text-[#292d32]"
              defaultValue={user?.gender || ""} >
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country" className="text-[#292d32] font-medium">
              Country
            </Label>
            <Select defaultValue={user?.country || ""}>
              <SelectTrigger className="w-full bg-[#f9fafb] border-[#e5e5e5] text-[#292d32]"
              value={user.country}>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vietnam">Viet Nam</SelectItem>
                <SelectItem value="usa">United States</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="canada">Canada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>):null}
      </div>
    </div>
  );
}
