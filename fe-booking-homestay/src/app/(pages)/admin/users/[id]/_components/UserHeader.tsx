"use client";

import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { toast } from "@/_components/ui/use-toast";
import { UserAvatar } from "@/_components/UserAvatar";
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
  let cls = "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-400";
  let icon = null;

  if (r === "ADMIN") {
    cls =
      "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400 font-bold";
    icon = <ShieldCheck className="w-3.5 h-3.5" />;
  } else if (r === "HOST") {
    cls =
      "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400 font-medium";
  } else {
    cls =
      "bg-green-100 text-green-800 dark:bg-emerald-950/30 dark:text-emerald-400 font-medium";
  }

  return (
    <Badge
      className={`px-2.5 py-0.5 text-[10px] sm:text-xs uppercase tracking-wider ${cls}`}
    >
      {icon && <span className="mr-1">{icon}</span>} {r}
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
    [user],
  );

  const statusBadge = user.isActive ? (
    <Badge className="bg-emerald-50 text-emerald-600 border border-emerald-350 text-[10px] sm:text-xs py-0.5 px-2">
      Hoạt động
    </Badge>
  ) : (
    <Badge className="bg-gray-50 text-gray-500 border border-gray-300 text-[10px] sm:text-xs py-0.5 px-2">
      Không hoạt động
    </Badge>
  );

  const verifiedBadge = user.isVerified ? (
    <Badge className="bg-blue-50 text-blue-600 flex items-center gap-1 border border-blue-300 text-[10px] sm:text-xs py-0.5 px-2">
      <ShieldCheck className="w-3 h-3" /> Đã xác minh
    </Badge>
  ) : (
    <Badge className="bg-rose-55/70 text-rose-650 flex items-center gap-1 border border-rose-300 text-[10px] sm:text-xs py-0.5 px-2">
      <ShieldAlert className="w-3 h-3" /> Chưa xác minh
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
    <div className="bg-card p-4 sm:p-6 rounded-2xl shadow-xs border border-border">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between border-b border-border pb-4 mb-4">
        <Link href="/admin/users" className="self-start">
          <Button
            variant="ghost"
            className="text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2 h-9 px-3 text-xs sm:text-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </Link>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <RefreshButton
            onRefresh={onRefresh}
            label=""
            className="h-9! w-9! p-0! sm:w-auto! sm:h-9! sm:px-3! rounded-lg cursor-pointer shrink-0"
          />

          <Button
            variant="outline"
            className="gap-1.5 h-9 text-xs sm:text-sm px-3 rounded-lg cursor-pointer flex-1 sm:flex-none border-border/80"
            onClick={onEdit}
          >
            <Pencil className="w-3.5 h-3.5" />
            Chỉnh sửa
          </Button>

          <Button
            variant="destructive"
            disabled={deleting}
            onClick={onDelete}
            className="gap-1.5 h-9 text-xs sm:text-sm px-3 rounded-lg cursor-pointer flex-1 sm:flex-none text-white hover:bg-destructive/90"
          >
            <Trash2 className="w-3.5 h-3.5" />
            {deleting ? "Đang xoá..." : "Xoá"}
          </Button>
        </div>
      </div>

      {/* Main Info Section */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
        {/* Avatar block */}
        <div className="relative group w-fit shrink-0">
          <UserAvatar
            avatarUrl={user.avatar}
            fullName={fullName}
            className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-card shadow-md rounded-full"
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
              <Upload className="w-5 h-5 text-white" />
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

        {/* Text info block */}
        <div className="flex-1 w-full text-center md:text-left">
          <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {fullName}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            ID người dùng: #{user.id}
          </p>

          <div className="mt-3.5 flex flex-wrap items-center justify-center md:justify-start gap-2">
            {(user.roles ?? ["USER"]).map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
            {statusBadge}
            {verifiedBadge}
          </div>

          <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/60 text-xs sm:text-sm text-slate-650 dark:text-slate-350 space-y-2.5 max-w-md mx-auto md:mx-0">
            <p className="flex items-center gap-2 justify-center md:justify-start">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Email:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 break-all">
                {user.email}
              </span>
            </p>
            <p className="flex items-center gap-2 justify-center md:justify-start">
              <Phone className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Số điện thoại:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {user.phoneNumber ?? "Chưa cung cấp"}
              </span>
            </p>
            <p className="flex items-center gap-2 justify-center md:justify-start">
              <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Ngày tham gia:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {formatDate(user.createdAt)}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
