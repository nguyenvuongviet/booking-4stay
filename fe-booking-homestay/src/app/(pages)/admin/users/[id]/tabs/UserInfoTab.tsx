"use client";

import { Card } from "@/_components/ui/card";
import { formatDate } from "@/lib/utils/date";
import { getUserById } from "@/services/admin/usersApi";
import { User } from "@/types/user";
import {
  Award,
  Briefcase,
  Calendar,
  CalendarDays,
  Gift,
  Lock,
  Mail,
  MapPin,
  Moon,
  Phone,
  User as UserIcon,
} from "lucide-react";
import { useEffect, useState } from "react";

function InfoDetail({
  icon,
  label,
  value,
  isMain = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: any;
  isMain?: boolean;
}) {
  return (
    <div className="flex items-start gap-3.5">
      <div
        className={`shrink-0 mt-0.5 ${isMain ? "text-primary" : "text-slate-400 dark:text-slate-500"}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`font-semibold mt-0.5 break-all ${
            isMain
              ? "text-lg sm:text-xl text-slate-900 dark:text-white"
              : "text-xs sm:text-sm text-slate-800 dark:text-slate-200"
          }`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

export default function UserInfoTab({
  userId,
  refreshKey,
}: {
  userId: number;
  refreshKey: number;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function reload() {
    try {
      setLoading(true);
      const data = await getUserById(userId);
      setUser(data);
    } catch (err) {
      console.error("Failed to reload user info:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, [refreshKey]);

  if (loading || !user) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 animate-pulse">
        <div className="lg:col-span-2 space-y-5 sm:space-y-6">
          {/* Basic Info Skeleton */}
          <Card className="p-4 sm:p-6 rounded-2xl border border-border shadow-xs">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-5 pb-3 border-b border-border/80" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Contact Info Skeleton */}
          <Card className="p-4 sm:p-6 rounded-2xl border border-border shadow-xs">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-5 pb-3 border-b border-border/80" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Loyalty Skeleton */}
        <Card className="p-4 sm:p-6 rounded-2xl border border-border shadow-xs h-fit">
          <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-5 pb-3 border-b border-border/80" />
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="w-5.5 h-5.5 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const loyalty = user.loyalty_program;
  const genderMap = {
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 animate-fade">
      <div className="lg:col-span-2 space-y-5 sm:space-y-6">
        {/* Basic Info */}
        <Card className="p-4 sm:p-6 rounded-2xl shadow-xs border border-border">
          <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100 mb-4 border-b border-border pb-3">
            Thông tin cơ bản
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
            <InfoDetail
              icon={<UserIcon className="w-4.5 h-4.5" />}
              label="Tên đầy đủ"
              value={
                `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "N/A"
              }
            />
            <InfoDetail
              icon={<Calendar className="w-4.5 h-4.5" />}
              label="Ngày sinh"
              value={user.dateOfBirth ? formatDate(user.dateOfBirth) : "N/A"}
            />
            <InfoDetail
              icon={<Briefcase className="w-4.5 h-4.5" />}
              label="Giới tính"
              value={genderMap[user.gender as keyof typeof genderMap] || "N/A"}
            />
            <InfoDetail
              icon={<MapPin className="w-4.5 h-4.5" />}
              label="Quốc gia"
              value={user.country || "N/A"}
            />
            <InfoDetail
              icon={<CalendarDays className="w-4.5 h-4.5" />}
              label="Ngày tham gia"
              value={formatDate(user.createdAt)}
            />
            <InfoDetail
              icon={<Lock className="w-4.5 h-4.5" />}
              label="Phương thức"
              value={user.provider}
            />
          </div>
        </Card>

        {/* Contact Info */}
        <Card className="p-4 sm:p-6 rounded-2xl shadow-xs border border-border">
          <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100 mb-4 border-b border-border pb-3">
            Thông tin liên hệ
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            <InfoDetail
              icon={<Mail className="w-4.5 h-4.5" />}
              label="Email"
              value={user.email}
            />
            <InfoDetail
              icon={<Phone className="w-4.5 h-4.5" />}
              label="Số điện thoại"
              value={user.phoneNumber || "Chưa cung cấp"}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Loyalty Program */}
        <Card className="p-4 sm:p-6 rounded-2xl shadow-xs border border-border">
          <h3 className="text-base sm:text-lg font-bold text-slate-850 dark:text-slate-100 mb-4 border-b border-border pb-3">
            Khách hàng thân thiết
          </h3>

          {loyalty ? (
            <div className="space-y-4">
              <InfoDetail
                icon={<Award className="w-5.5 h-5.5 text-amber-500" />}
                label="Cấp độ hiện tại"
                value={loyalty.levels?.name || "N/A"}
                isMain
              />
              <InfoDetail
                icon={<Gift className="w-5.5 h-5.5 text-primary" />}
                label="Tổng điểm"
                value={loyalty.totalPoint?.toLocaleString()}
                isMain
              />
              <InfoDetail
                icon={<Briefcase className="w-4.5 h-4.5" />}
                label="Số lượt đặt phòng đã lưu trú"
                value={loyalty.totalBooking}
              />
              <InfoDetail
                icon={<Moon className="w-4.5 h-4.5" />}
                label="Tổng số đêm lưu trú"
                value={loyalty.totalNight}
              />
              <InfoDetail
                icon={<Calendar className="w-4.5 h-4.5" />}
                label="Ngày thăng cấp gần nhất"
                value={
                  loyalty.lastUpgradeDate
                    ? formatDate(loyalty.lastUpgradeDate)
                    : "N/A"
                }
              />
            </div>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 italic text-xs py-2">
              Người dùng này chưa tham gia chương trình.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
