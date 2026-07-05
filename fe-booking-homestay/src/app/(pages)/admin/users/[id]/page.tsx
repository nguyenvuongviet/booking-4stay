"use client";

import { toast } from "@/_components/ui/use-toast";
import { useAuth } from "@/context/auth-context";
import { deleteUser, getUserById, updateUser } from "@/services/admin/usersApi";
import { User } from "@/types/user";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserEditModal } from "../_components/UserEditModal";
import UserHeader from "./_components/UserHeader";
import UserTabs from "./_components/UserTabs";

export default function UserDetailPage() {
  const { id } = useParams();
  const userId = Number(id);
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [openEdit, setOpenEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [refreshKey, setRefreshKey] = useState(0);

  const { user: currentUser, updateUser: updateAuthUser } = useAuth();
  function syncAuthIfCurrent(updated: User) {
    if (!currentUser) return;
    if (Number(currentUser.id) !== Number(updated.id)) return;

    updateAuthUser({
      ...currentUser!,
      firstName: updated.firstName ?? "",
      lastName: updated.lastName ?? "",
      email: updated.email ?? currentUser?.email,
      avatar: updated.avatar ?? currentUser?.avatar,
    });
  }

  async function loadUser() {
    try {
      setLoading(true);
      const data = await getUserById(userId);
      setUser(data);
    } catch {
      toast({ variant: "destructive", title: "Không tìm thấy người dùng" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, [userId]);

  async function handleUpdate(payload: any) {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await updateUser(userId, payload);
      setUser(updated);
      setOpenEdit(false);

      syncAuthIfCurrent(updated);

      toast({ variant: "success", title: "Cập nhật thành công" });
      setRefreshKey((k) => k + 1);
    } catch {
      toast({ variant: "destructive", title: "Cập nhật thất bại" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteUser(userId);
      toast({ variant: "success", title: "Đã xoá người dùng" });
      router.push("/admin/users");
    } catch {
      toast({ variant: "destructive", title: "Không thể xoá người dùng" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="bg-card p-4 sm:p-6 rounded-2xl border border-border shadow-xs flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
          <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
          <div className="grow w-full space-y-4 text-center md:text-left mt-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mx-auto md:mx-0" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mx-auto md:mx-0" />
            <div className="flex gap-2 justify-center md:justify-start">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-16" />
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-20" />
            </div>
            <div className="pt-4 border-t border-border space-y-3 max-w-md mx-auto md:mx-0">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className="h-11 bg-slate-100 dark:bg-slate-800 rounded-xl sm:rounded-2xl w-full" />

        {/* Info Tab Content Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <div className="lg:col-span-2 space-y-5 sm:space-y-6">
            <div className="p-4 sm:p-6 bg-card border border-border rounded-2xl h-52 flex flex-col justify-between">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-5 pb-3 border-b border-border/80" />
              <div className="grid grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 sm:p-6 bg-card border border-border rounded-2xl h-36 flex flex-col justify-between">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/4 mb-5 pb-3 border-b border-border/80" />
              <div className="grid grid-cols-2 gap-5">
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                    <div className="space-y-1.5 flex-1">
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-6 bg-card border border-border rounded-2xl h-80 flex flex-col justify-between">
            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-5 pb-3 border-b border-border/80" />
            <div className="space-y-5 flex-1">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="w-5 h-5 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user)
    return <div className="p-6 text-red-600">Không tìm thấy người dùng.</div>;

  return (
    <div className="space-y-6">
      <UserHeader
        user={user}
        deleting={deleting}
        onEdit={() => setOpenEdit(true)}
        onDelete={handleDelete}
        onUserChange={(u) => {
          setUser(u);
          syncAuthIfCurrent(u);
        }}
        onRefresh={() => setRefreshKey((k) => k + 1)}
      />

      <UserTabs user={user} refreshKey={refreshKey} />

      <UserEditModal
        open={openEdit}
        onOpenChange={setOpenEdit}
        saving={saving}
        initialData={{
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          phoneNumber: user.phoneNumber ?? "",
          country: user.country ?? "",
          dateOfBirth: user.dateOfBirth ?? "",
          gender: user.gender ?? "OTHER",
          roleName: user.roles?.[0] ?? "USER",
          isActive: user.isActive,
        }}
        meta={{ email: user.email, createdAt: user.createdAt }}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
