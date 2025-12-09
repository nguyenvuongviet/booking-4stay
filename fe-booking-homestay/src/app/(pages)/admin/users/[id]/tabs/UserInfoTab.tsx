"use client";

import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
    <div className="flex items-start gap-4">
      <div className={`shrink-0 ${isMain ? "text-black" : "text-gray-500"}`}>
        {icon}
      </div>
      <div>
        <p
          className={`text-sm font-medium ${
            isMain ? "text-gray-900" : "text-gray-500"
          }`}
        >
          {label}
        </p>
        <p
          className={`font-medium ${
            isMain ? "text-xl text-black" : "text-gray-800"
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

  if (loading || !user) return <Skeleton />;

  const loyalty = user.loyalty_program;
  const genderMap = {
    MALE: "Nam",
    FEMALE: "Nữ",
    OTHER: "Khác",
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade">
      <div className="lg:col-span-2 space-y-6">
        <Card className="p-6 rounded-xl shadow-md border">
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-3">
            Thông tin cơ bản
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoDetail
              icon={<UserIcon className="w-5 h-5" />}
              label="Tên đầy đủ"
              value={`${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()}
            />
            <InfoDetail
              icon={<Calendar className="w-5 h-5" />}
              label="Ngày sinh"
              value={user.dateOfBirth ? formatDate(user.dateOfBirth) : "N/A"}
            />
            <InfoDetail
              icon={<Briefcase className="w-5 h-5" />}
              label="Giới tính"
              value={genderMap[user.gender as keyof typeof genderMap] || "N/A"}
            />
            <InfoDetail
              icon={<MapPin className="w-5 h-5" />}
              label="Quốc gia"
              value={user.country || "N/A"}
            />
            <InfoDetail
              icon={<CalendarDays className="w-5 h-5" />}
              label="Ngày tham gia"
              value={formatDate(user.createdAt)}
            />
            <InfoDetail
              icon={<Lock className="w-5 h-5" />}
              label="Tài khoản"
              value={user.provider}
            />
          </div>
        </Card>

        <Card className="p-6 rounded-xl shadow-md border">
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-3">
            Thông tin liên hệ
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            <InfoDetail
              icon={<Mail className="w-5 h-5" />}
              label="Email"
              value={user.email}
            />
            <InfoDetail
              icon={<Phone className="w-5 h-5" />}
              label="Số điện thoại"
              value={user.phoneNumber || "Chưa cung cấp"}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="p-6 rounded-xl shadow-md border">
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-3">
            Chương trình khách hàng thân thiết
          </h3>

          {loyalty ? (
            <div className="space-y-4">
              <InfoDetail
                icon={<Award className="w-6 h-6" />}
                label="Cấp độ hiện tại"
                value={loyalty.levels?.name || "N/A"}
                isMain
              />
              <InfoDetail
                icon={<Gift className="w-6 h-6" />}
                label="Tổng điểm"
                value={loyalty.totalPoint?.toLocaleString()}
                isMain
              />
              <InfoDetail
                icon={<Briefcase className="w-5 h-5" />}
                label="Tổng lượt đặt phòng đã lưu trú"
                value={loyalty.totalBooking}
              />
              <InfoDetail
                icon={<Moon className="w-5 h-5" />}
                label="Tổng số đêm lưu trú"
                value={loyalty.totalNight}
              />
              <InfoDetail
                icon={<Calendar className="w-5 h-5" />}
                label="Ngày thăng cấp gần nhất"
                value={
                  loyalty.lastUpgradeDate
                    ? formatDate(loyalty.lastUpgradeDate)
                    : "N/A"
                }
              />
            </div>
          ) : (
            <p className="text-gray-500 italic">
              Người dùng này chưa có Loyalty.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
