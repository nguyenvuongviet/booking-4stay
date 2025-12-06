"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/utils/date";
import { uploadUserAvatar } from "@/services/admin/usersApi";
import { User } from "@/types/user";
import {
  ArrowLeft,
  CalendarDays,
  Mail,
  Pencil,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { RefreshButton } from "../../../_components/RefreshButton";
import { AvatarSpinner } from "./AvatarSpinner";

function RoleBadge({ role }: { role: string }) {
  const r = role.toUpperCase();
  let cls = "bg-gray-100 text-gray-800";
  let icon = null;

  if (r === "ADMIN") {
    cls = "bg-red-100 text-red-800 font-bold";
    icon = <ShieldCheck className="w-3.5 h-3.5" />;
  } else if (r === "HOST") {
    cls = "bg-gray-100 text-gray-800 font-medium";
  } else {
    cls = "bg-green-100 text-green-800 font-medium";
  }

  return (
    <Badge className={`px-3 py-1 text-xs uppercase tracking-wider ${cls}`}>
      {icon} {r}
    </Badge>
  );
}

export default function UserHeader({
  user,
  deleting,
  onEdit,
  onDelete,
  onUserChange,
  onRefresh,
}: {
  user: User;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onUserChange: (u: User) => void;
  onRefresh: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const fullName = useMemo(
    () => `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
    [user]
  );

  const statusBadge = user.isActive ? (
    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-300">
      Hoạt động
    </Badge>
  ) : (
    <Badge className="bg-gray-50 text-gray-500 border border-gray-300">
      Không hoạt động
    </Badge>
  );

  const verifiedBadge = user.isVerified ? (
    <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1.5 border border-blue-300">
      <ShieldCheck className="w-3.5 h-3.5" /> Đã xác minh
    </Badge>
  ) : (
    <Badge className="bg-rose-100 text-rose-700 flex items-center gap-1.5 border border-rose-300">
      <ShieldAlert className="w-3.5 h-3.5" /> Chưa xác minh
    </Badge>
  );

  async function handleAvatarUpload(file: File) {
    setUploading(true);
    try {
      const res = await uploadUserAvatar(user.id, file);
      if (res.imgUrl) {
        const updated = { ...user, avatar: res.imgUrl };
        onUserChange(updated);
        toast({ variant: "success", title: "Đã cập nhật ảnh đại diện" });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Tải ảnh thất bại",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <Link href="/admin/users">
          <Button
            variant="ghost"
            className="text-gray-500 hover:bg-gray-100 gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Button>
        </Link>

        <div className="flex items-center gap-3">
          <RefreshButton onRefresh={onRefresh} />

          <Button variant="outline" className="gap-2" onClick={onEdit}>
            <Pencil className="w-4 h-4" />
            Chỉnh sửa
          </Button>

          <Button
            disabled={deleting}
            onClick={onDelete}
            className="bg-red-600 text-white hover:bg-red-700 gap-2 shadow-md"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Đang xoá..." : "Xoá"}
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-8">
        <div className="relative group w-fit shrink-0">
          <UserAvatar
            avatarUrl={user.avatar}
            fullName={fullName}
            className="w-32 h-32 border-4 border-white shadow-lg rounded-full"
          />
          <div
            className={`absolute inset-0 bg-black/50 flex items-center justify-center rounded-full transition duration-300 cursor-pointer ${
              uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
            onClick={() => !uploading && fileRef.current?.click()}
            title="Đổi ảnh đại diện"
          >
            {uploading ? (
              <AvatarSpinner />
            ) : (
              <Upload className="w-6 h-6 text-white" />
            )}
          </div>

          <input
            ref={fileRef}
            type="file"
            hidden
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleAvatarUpload(file);
            }}
          />
        </div>

        <div className="flex-1">
          <h2 className="text-3xl font-extrabold text-gray-900">{fullName}</h2>
          <p className="text-sm text-gray-500 mt-0.5">ID: #{user.id}</p>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            {(user.roles ?? ["USER"]).map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
            {statusBadge}
            {verifiedBadge}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-600 space-y-2">
            <p className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              Email:{" "}
              <span className="font-semibold text-gray-800">{user.email}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              SĐT:{" "}
              <span className="font-medium">
                {user.phoneNumber ?? "Chưa cung cấp"}
              </span>
            </p>
            <p className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-gray-500" />
              Ngày tham gia:
              <span className="font-medium ml-1">
                {formatDate(user.createdAt)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
