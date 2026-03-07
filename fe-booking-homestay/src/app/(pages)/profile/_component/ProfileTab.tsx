import { Button } from "@/_components/ui/button";
import { Input } from "@/_components/ui/input";
import { Label } from "@/_components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/_components/ui/select";
import { COUNTRIES } from "@/constants/countries";
import { useLang } from "@/context/lang-context";
import { IUser } from "@/models/User";
import { Calendar, Edit2, Save, Upload } from "lucide-react";
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

export default function ProfileTab({ user, isEditing, handleSubmit, handleEditClick, handleAvatarUpload, fileInputRef, avatarUrl, firstName, setFirstName, lastName, setLastName, email, phone, dob, setDob, gender, setGender, country, setCountry }: Props) {
    const { t } = useLang();

    if (!user) return null;

    return (
        <div className="mt-2 px-16 py-8 rounded-xl bg-card space-y-4">
            {/* Header */}
            <div className="flex justify-between mb-8">
                <h1 className="text-4xl elegant-heading mb-4">
                    {t("my_profile")}
                </h1>
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
                    {isEditing ? t("save") : t("edit")}
                </Button>
            </div>

            {/* Avatar & Form */}
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
                                <span className="text-xs text-white">
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
                </div>

                {/* Form */}
                {user ? (
                    <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <Label htmlFor="firstName" className="elegant-subheading">
                                {t("firstName")}
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
                                {t("lastName")}
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
                                {t("phone")}
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
                                {t("dob")}
                            </Label>
                            <div className="relative w-full">
                                <DatePicker
                                    id="dob"
                                    selected={dob}
                                    onChange={(date) => setDob(date)}
                                    dateFormat="dd/MM/yyyy"
                                    className={`w-full rounded-xl border border-input bg-input px-3 py-2 text-sm shadow-xs outline-none ${!isEditing ? "opacity-70 cursor-not-allowed" : ""
                                        }`}
                                    wrapperClassName="w-full"

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
                                {t("gender")}
                            </Label>
                            <Select
                                value={gender}
                                onValueChange={setGender}
                                disabled={!isEditing}
                            >
                                <SelectTrigger
                                    className={`w-full bg-input rounded-xl placeholder:text-muted ${!isEditing ? "opacity-70 cursor-not-allowed" : ""
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
                        <div className="space-y-2">
                            <Label htmlFor="country" className="elegant-subheading">
                                {t("country")}
                            </Label>
                            <Select
                                value={country}
                                onValueChange={setCountry}
                                disabled={!isEditing}
                            >
                                <SelectTrigger
                                    className={`w-full bg-input rounded-xl placeholder:text-muted ${!isEditing ? "opacity-70 cursor-not-allowed" : ""
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
                ) : (
                    <p className="text-center text-gray-500">{t("no_user")}</p>
                )}
            </div>
        </div>
    );
}
