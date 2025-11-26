"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { UserEditModal } from "@/app/(pages)/admin/users/_components/UserEditModal";
import Loader from "@/components/loader/Loader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { UserAvatar } from "@/components/UserAvatar";

import { formatDate } from "@/lib/utils/date";
import { handleDeleteEntity } from "@/lib/utils/handleDelete";
import {
  deleteUser,
  getUserById,
  updateUser,
  uploadUserAvatar,
} from "@/services/admin/usersApi";
import type { UpdateUserDto, User } from "@/types/user";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  Mail,
  MapPin,
  Pencil,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/auth-context";

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
  const params = useParams();
  const userId = Number(params.id);
  const router = useRouter();

  const { user: currentUser, updateUser: updateAuthUser } = useAuth();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

      if (Number(currentUser?.id) === updated.id) {
        updateAuthUser({
          ...currentUser!,
          firstName: updated.firstName ?? "",
          lastName: updated.lastName ?? "",
          email: updated.email ?? currentUser?.email,
          avatar: updated.avatar ?? currentUser?.avatar,
        });
      }

      toast({
        variant: "success",
        title: "Cập nhật thành công",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Cập nhật thất bại",
        description:
          err?.response?.data?.message || err?.message || "Vui lòng thử lại.",
      });
    } finally {
      setSaving(false);
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Tệp không hợp lệ",
        description: "Vui lòng chọn ảnh hợp lệ (.jpg, .png, .jpeg).",
      });
      return;
    }

    setUploading(true);
    try {
      const res = await uploadUserAvatar(user.id, file);
      const imgUrl = res.imgUrl;

      if (!imgUrl) throw new Error("Không nhận được URL ảnh trả về");

      setUser((prev) => (prev ? { ...prev, avatar: imgUrl } : prev));

      if (Number(currentUser?.id) === user.id) {
        updateAuthUser({
          ...currentUser!,
          avatar: imgUrl,
        });
      }

      toast({
        variant: "success",
        title: "Cập nhật ảnh đại diện thành công!",
      });
    } catch (err: any) {
      console.error("Upload avatar error:", err);
      toast({
        variant: "destructive",
        title: "Tải ảnh thất bại",
        description:
          err?.response?.data?.message ||
          err?.message ||
          "Không thể tải lên ảnh.",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  async function handleDelete() {
    if (!user) return;
    setDeleting(true);

    await handleDeleteEntity(
      "người dùng",
      () => deleteUser(userId),
      () => {
        router.push("/admin/users");
      }
    );

    setDeleting(false);
  }

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader />
      </div>
    );
  if (notFound || !user)
    return (
      <Card className="p-6 text-center text-red-600">
        Không tìm thấy người dùng.
        <div className="mt-4 flex justify-center">
          <Link href="/admin/users">
            <Button variant="outline">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </Card>
    );

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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/users">
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <ArrowLeft className="w-6 h-6 text-warm-700" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-warm-900">{fullName}</h1>
            <p className="text-sm text-muted-foreground">
              Chi tiết thông tin người dùng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenEdit(true)}
            className="gap-2"
          >
            <Pencil className="w-4 h-4" />
            Chỉnh sửa
          </Button>
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="gap-2 text-white bg-red-500 hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </div>
      </div>

      <Card className="p-6 border-warm-200">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="relative group w-fit">
            <UserAvatar
              avatarUrl={user.avatar}
              fullName={fullName}
              className="w-28 h-28 border shrink-0"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-full cursor-pointer">
              {uploading ? (
                <Loader />
              ) : (
                <Button
                  size="sm"
                  className="bg-white/50 hover:bg-white text-warm-900 text-xs gap-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4" />
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
          </div>

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
                  Provider:{" "}
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
          <LabelValue label="Giới tính" value={user.gender ?? "-"} />
          <LabelValue label="Ngày sinh" value={formatDate(user.dateOfBirth)} />
          <LabelValue label="Quốc gia" value={user.country ?? "-"} />
          <LabelValue
            label="Cấp độ Loyalty"
            value={user.loyalty_program.levels.name ?? "-"}
          />
        </div>
      </Card>

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
