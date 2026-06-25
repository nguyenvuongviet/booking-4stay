"use client";

import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/_components/ui/select";
import { COUNTRIES } from "@/constants/countries";
import { useLang } from "@/context/lang-context";
import { IUser } from "@/models/User";
import { Calendar, Edit2, MapPin, Save, User as UserIcon } from "lucide-react";
import { DatePicker } from "react-datepicker";

interface Props {
  user: IUser | null;
  isEditing: boolean;
  handleEditClick: () => void;
  handleSubmit: () => void;
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

export default function ProfileTab({
  user,
  isEditing,
  handleSubmit,
  handleEditClick,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  phone,
  dob,
  setDob,
  gender,
  setGender,
  country,
  setCountry,
}: Props) {
  const { t } = useLang();
  if (!user) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header section with edit button */}
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-5 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
        <div>
          <h2 className="text-2xl md:text-3xl elegant-heading tracking-tight dark:text-white">
            {t("my_profile")}
          </h2>
          <p className="text-slate-500 text-xs md:text-sm mt-1">
            Quản lý thông tin cá nhân của bạn.
          </p>
        </div>
        <Button
          onClick={isEditing ? handleSubmit : handleEditClick}
          className={`gap-2 rounded-xl shadow-xs transition-all h-10 px-4`}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit2 className="h-4 w-4" />
          )}
          <span>{isEditing ? t("save") : t("edit")}</span>
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="space-y-6">
          {/* Basic Info Box */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100 border-b border-slate-50 dark:border-slate-800/50 pb-4">
              <UserIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold tracking-tight">
                Thông tin cá nhân
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label
                  htmlFor="firstName"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
                >
                  {t("firstName")}
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`rounded-xl h-11 transition-all duration-200 ${
                    isEditing
                      ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-900 cursor-not-allowed select-none opacity-80"
                  }`}
                  readOnly={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="lastName"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
                >
                  {t("lastName")}
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`rounded-xl h-11 transition-all duration-200 ${
                    isEditing
                      ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-xs"
                      : "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-900 cursor-not-allowed select-none opacity-80"
                  }`}
                  readOnly={!isEditing}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dob"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
                >
                  {t("dob")}
                </Label>
                <div className="relative w-full">
                  <DatePicker
                    id="dob"
                    selected={dob}
                    onChange={(date) => setDob(date)}
                    dateFormat="dd/MM/yyyy"
                    className={`w-full rounded-xl border px-3 py-2 text-sm outline-none transition-all duration-200 ${
                      isEditing
                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/10 shadow-xs h-11"
                        : "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-900 cursor-not-allowed opacity-80 h-11"
                    }`}
                    wrapperClassName="w-full"
                    maxDate={new Date()}
                    disabled={!isEditing}
                  />
                  <Calendar
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
                >
                  {t("gender")}
                </Label>
                <Select
                  value={gender}
                  onValueChange={setGender}
                  disabled={!isEditing}
                >
                  <SelectTrigger
                    className={`w-full rounded-xl h-11! transition-all duration-200 ${
                      isEditing
                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        : "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-900 cursor-not-allowed opacity-80"
                    }`}
                  >
                    <SelectValue placeholder={t("select_gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FEMALE">{t("female")}</SelectItem>
                    <SelectItem value="MALE">{t("male")}</SelectItem>
                    <SelectItem value="OTHER">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Contact Info Box */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 lg:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs">
            <div className="flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100 border-b border-slate-50 dark:border-slate-800/50 pb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold tracking-tight">
                Thông tin liên hệ
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2 lg:col-span-2">
                <Label
                  htmlFor="email"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="rounded-xl bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-900 h-11 text-slate-500 cursor-not-allowed select-none opacity-80 border"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
                >
                  {t("phone")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  readOnly
                  className="rounded-xl bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-900 h-11 text-slate-500 cursor-not-allowed select-none opacity-80 border"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="country"
                  className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide uppercase"
                >
                  {t("country")}
                </Label>
                <Select
                  value={country}
                  onValueChange={setCountry}
                  disabled={!isEditing}
                >
                  <SelectTrigger
                    className={`w-full rounded-xl h-11! transition-all duration-200 ${
                      isEditing
                        ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/10"
                        : "bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-900 cursor-not-allowed opacity-80"
                    }`}
                  >
                    <SelectValue placeholder={t("select_country")} />
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
          </div>
        </div>
      </div>
    </div>
  );
}
