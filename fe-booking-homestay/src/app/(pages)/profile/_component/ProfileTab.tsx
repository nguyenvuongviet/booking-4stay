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
import {
  Calendar,
  Edit2,
  MapPin,
  Save,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { RefObject } from "react";
import { DatePicker } from "react-datepicker";

interface Props {
  user: IUser | null;
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

export default function ProfileTab({
  user,
  isEditing,
  handleSubmit,
  handleEditClick,
  handleAvatarUpload,
  fileInputRef,
  avatarUrl,
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
      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <h2 className="text-3xl elegant-heading tracking-tight dark:text-white">
            {t("my_profile")}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý thông tin cá nhân.
          </p>
        </div>
        <Button
          onClick={isEditing ? handleSubmit : handleEditClick}
          className={`gap-2 rounded-xl shadow-sm transition-all`}
          variant={isEditing ? "default" : "outline"}
        >
          {isEditing ? (
            <Save className="h-4 w-4" />
          ) : (
            <Edit2 className="h-4 w-4" />
          )}
          {isEditing ? t("save") : t("edit")}
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="space-y-6">
          {/* Basic Info Box */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6 dark:text-slate-100">
              <UserIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold"> Thông tin cá nhân</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="flex justify-center lg:col-span-1 relative w-40 h-40 rounded-full overflow-hidden group mb-4 ring-4 ring-slate-50 dark:ring-slate-800">
                <img
                  className="w-full h-full object-cover"
                  src={avatarUrl}
                  alt="avatar"
                />
                {isEditing && (
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full backdrop-blur-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="text-white h-6 w-6 mb-2" />
                    <span className="text-xs font-medium text-white tracking-wide">
                      {t("upload")}
                    </span>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:col-span-2">
                <div className="space-y-2.5">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-medium text-muted-foreground dark:text-slate-300"
                  >
                    {t("firstName")}
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`rounded-xl bg-input dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-11 focus-visible:ring-primary ${!isEditing ? "opacity-80" : ""}`}
                    readOnly={!isEditing}
                  />
                </div>
                <div className="space-y-2.5">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-medium text-muted-foreground dark:text-slate-300"
                  >
                    {t("lastName")}
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`rounded-xl bg-input dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 h-11 focus-visible:ring-primary ${!isEditing ? "opacity-80" : ""}`}
                    readOnly={!isEditing}
                  />
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="dob"
                    className="text-sm font-medium text-muted-foreground dark:text-slate-300"
                  >
                    {t("dob")}
                  </Label>
                  <div className="relative w-full">
                    <DatePicker
                      id="dob"
                      selected={dob}
                      onChange={(date) => setDob(date)}
                      dateFormat="dd/MM/yyyy"
                      className={`w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-input dark:bg-slate-800/50 h-11 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow ${!isEditing ? "opacity-80 cursor-not-allowed" : ""}`}
                      wrapperClassName="w-full"
                      maxDate={new Date()}
                      disabled={!isEditing}
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                      size={18}
                    />
                  </div>
                </div>

                <div className="space-y-2.5">
                  <Label
                    htmlFor="gender"
                    className="text-sm font-medium text-muted-foreground dark:text-slate-300"
                  >
                    {t("gender")}
                  </Label>
                  <Select
                    value={gender}
                    onValueChange={setGender}
                    disabled={!isEditing}
                  >
                    <SelectTrigger
                      className={`w-full rounded-xl border-slate-200 dark:border-slate-700 bg-input dark:bg-slate-800/50 h-11 ${!isEditing ? "opacity-80 cursor-not-allowed" : ""}`}
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
          </div>

          {/* Contact Info Box */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-border dark:border-slate-800 shadow-sm">
            <div className="flex items-center gap-2 mb-6 dark:text-slate-100">
              <MapPin className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Thông tin liên hệ</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2.5 md:col-span-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-muted-foreground dark:text-slate-300"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="rounded-xl bg-input dark:bg-slate-800/50 border-transparent h-11 text-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2.5">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-muted-foreground dark:text-slate-300"
                >
                  {t("phone")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  readOnly
                  className="rounded-xl bg-input dark:bg-slate-800/50 border-transparent h-11 text-muted cursor-not-allowed"
                />
              </div>
              <div className="space-y-2.5">
                <Label
                  htmlFor="country"
                  className="text-sm font-medium text-muted-foreground dark:text-slate-300"
                >
                  {t("country")}
                </Label>
                <Select
                  value={country}
                  onValueChange={setCountry}
                  disabled={!isEditing}
                >
                  <SelectTrigger
                    className={`w-full rounded-xl border-slate-200 dark:border-slate-700 bg-input dark:bg-slate-800/50 h-11 ${!isEditing ? "opacity-80 cursor-not-allowed" : ""}`}
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
