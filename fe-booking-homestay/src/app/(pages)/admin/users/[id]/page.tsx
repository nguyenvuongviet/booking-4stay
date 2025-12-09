"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
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

  if (loading) return <Skeleton className="p-6" />;

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
