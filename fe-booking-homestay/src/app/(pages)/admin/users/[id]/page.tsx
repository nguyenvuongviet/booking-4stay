"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import Loader from "@/components/loader/Loader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { UserAvatar } from "@/components/UserAvatar";
import { UserEditModal } from "@/components/admin/user-edit-modal";

import { formatDate } from "@/lib/utils/date";
import { getUserById, updateUser } from "@/services/admin/usersApi";
import type { UpdateUserDto, User } from "@/types/user";
import {
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ShieldCheck,
  ShieldAlert,
  User as UserIcon,
  ChevronLeft,
  Pencil,
} from "lucide-react";

function Line() {
  return <div className="border-t border-warm-200 my-4" />;
}

function LabelValue({
  icon: Icon,
  label,
  value,
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-warm-200 p-4 bg-warm-50/60 hover:bg-warm-100 transition-colors">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1.5">
        {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
        {label}
      </p>
      <p className="font-medium text-warm-900">{value || "–"}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const r = role.toUpperCase();
  const cls =
    r === "ADMIN"
      ? "bg-purple-100 text-purple-800"
      : r === "HOST"
      ? "bg-blue-100 text-blue-800"
      : "bg-amber-100 text-amber-800";
  return <Badge className={cls}>{r}</Badge>;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = Number(params.id);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);

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
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const fullName = useMemo(
    () =>
      user
        ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email
        : "",
    [user]
  );

  async function onSave(payload: UpdateUserDto) {
    if (!user) return;
    try {
      setSaving(true);

      const updated = await updateUser(userId, payload);
      setUser(updated);
      setOpenEdit(false);
      toast({
        variant: "success",
        title: "Cập nhật thành công",
        duration: 2000,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description:
          err?.response?.data?.message || err?.message || "Vui lòng thử lại.",
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  }

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
        <div className="mt-4 flex justify-center">
          <Button variant="outline" onClick={() => router.push("/admin/users")}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Quay lại danh sách
          </Button>
        </div>
      </Card>
    );
  }

  const statusBadge = user.isActive ? (
    <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>
  ) : (
    <Badge className="bg-gray-100 text-gray-800">Không hoạt động</Badge>
  );

  const verifiedBadge = user.isVerified ? (
    <Badge className="bg-emerald-100 text-emerald-800 flex items-center gap-1.5">
      <ShieldCheck className="w-3.5 h-3.5" />
      Đã xác minh
    </Badge>
  ) : (
    <Badge className="bg-rose-100 text-rose-700 flex items-center gap-1.5">
      <ShieldAlert className="w-3.5 h-3.5" />
      Chưa xác minh
    </Badge>
  );

  return (
    <div className="space-y-6 relative pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-warm-900">
          Thông tin người dùng
        </h1>
        <Button onClick={() => setOpenEdit(true)} className="gap-2 mt-3">
          <Pencil className="w-4 h-4" />
          Chỉnh sửa
        </Button>
      </div>

      <Card className="p-6 border-warm-200">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <UserAvatar
            avatarUrl={user.avatar}
            fullName={fullName}
            className="w-28 h-28 border shrink-0"
          />
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-warm-900">
                  {fullName}
                </h2>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {(user.roles?.length ? user.roles : ["USER"]).map((r) => (
                    <RoleBadge key={r} role={r} />
                  ))}
                  {statusBadge}
                  {verifiedBadge}
                </div>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  Ngày tạo:
                  <span className="font-medium text-warm-900 ml-1">
                    {formatDate(user.createdAt)}
                  </span>
                </p>
                <p>
                  Provider:
                  <span className="font-medium text-warm-900">
                    {user.provider}
                  </span>
                </p>
              </div>
            </div>

            <Line />

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <a
                href={`mailto:${user.email}`}
                className="flex items-center gap-2 hover:underline"
              >
                <Mail className="w-4 h-4" /> {user.email}
              </a>
              {user.phoneNumber && (
                <a
                  href={`tel:${user.phoneNumber}`}
                  className="flex items-center gap-2 hover:underline"
                >
                  <Phone className="w-4 h-4" /> {user.phoneNumber}
                </a>
              )}
              {user.country && (
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {user.country}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <LabelValue
            icon={UserIcon}
            label="Họ"
            value={user.firstName ?? "–"}
          />
          <LabelValue
            icon={UserIcon}
            label="Tên"
            value={user.lastName ?? "–"}
          />
          <LabelValue label="Giới tính" value={user.gender ?? "–"} />
          <LabelValue label="Ngày sinh" value={formatDate(user.dateOfBirth)} />
          <LabelValue label="Quốc gia" value={user.country ?? "–"} />
          <LabelValue label="Cấp độ Loyalty" value={user.loyaltyLevel ?? "–"} />
        </div>
      </Card>

      <div className="left-6 bottom-6 flex justify-end items-center gap-2">
        <Button variant="outline" onClick={() => router.push("/admin/users")}>
          <ChevronLeft className="w-4 h-4 mr-1" />
          Quay lại
        </Button>
      </div>

      <UserEditModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        saving={saving}
        initialData={{
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          phoneNumber: user.phoneNumber ?? "",
          country: user.country ?? "",
          roleName: (user.roles?.[0] as any) ?? "USER",
          dateOfBirth: user.dateOfBirth ?? "",
          gender: (user.gender as any) ?? "OTHER",
          isActive: user.isActive,
        }}
        meta={{
          email: user.email,
          createdAt: user.createdAt,
          isVerified: user.isVerified,
        }}
        onSubmit={onSave}
      />
    </div>
  );
}
