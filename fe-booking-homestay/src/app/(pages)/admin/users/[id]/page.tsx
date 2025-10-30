"use client";

import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/utils/date";
import { getUserById } from "@/services/admin/usersApi";
import type { User } from "@/types/user";
import { Mail, MapPin, Phone, User as UserIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-4 bg-warm-50 hover:bg-warm-100 transition-colors">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium text-warm-900">{value}</p>
    </div>
  );
}

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getUserById(userId);
        setUser(data);
      } catch (err: any) {
        if (err?.response?.status === 404) setNotFound(true);
        toast({
          variant: "destructive",
          title: "Không thể tải thông tin người dùng",
          description: err?.message || "Vui lòng thử lại.",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <Card className="p-6 text-center text-red-600">
        Không tìm thấy người dùng.
        <div className="mt-4">
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  const fullName =
    `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-warm-900">Thông tin người dùng</h1>

      <Card className="p-6 space-y-4 border-warm-200">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <UserAvatar
            avatarUrl={user.avatar}
            fullName={fullName}
            className="w-28 h-28 border"
          />

          <div className="flex-1 space-y-2">
            <h2 className="text-xl font-semibold text-warm-900">{fullName}</h2>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> {user.email}
              </p>
              {user.phoneNumber && (
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" /> {user.phoneNumber}
                </p>
              )}
              {user.country && (
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {user.country}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <Info label="Vai trò" value={user.roles?.join(", ") ?? "–"} />
          <Info label="Giới tính" value={user.gender ?? "–"} />
          <Info label="Ngày sinh" value={formatDate(user.dateOfBirth)} />
          <Info
            label="Trạng thái"
            value={user.isActive ? "Hoạt động" : "Không hoạt động"}
          />
          <Info
            label="Xác minh"
            value={user.isVerified ? "Đã xác minh" : "Chưa xác minh"}
          />
          <Info label="Cấp độ khách hàng" value={user.loyaltyLevel ?? "–"} />
          <Info label="Provider" value={user.provider} />
          <Info label="Ngày tạo tài khoản" value={formatDate(user.createdAt)} />
        </div>
      </Card>

      <div className="flex justify-end items-center">
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          Quay lại
        </Button>
      </div>
    </div>
  );
}
