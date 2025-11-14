"use client";

import { UserCreateModal } from "@/app/(pages)/admin/users/_components/UserCreateModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { UserAvatar } from "@/components/UserAvatar";
import { formatDate } from "@/lib/utils/date";
import { handleDeleteEntity } from "@/lib/utils/handleDelete";
import { createUser, deleteUser, getAllUsers } from "@/services/admin/usersApi";
import type { CreateUserDto, User } from "@/types/user";
import { Eye, Filter, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function getStatusColor(status: "active" | "inactive") {
  return status === "active"
    ? "bg-green-100 text-green-800"
    : "bg-gray-100 text-gray-800";
}
function getRoleColor(role: "USER" | "HOST" | "ADMIN" | string) {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800";
    case "HOST":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
}

export default function UsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<
    "all" | "USER" | "HOST" | "ADMIN"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Không thể tải danh sách người dùng";
      setError(msg);
      toast({
        variant: "destructive",
        title: "Lỗi tải dữ liệu",
        description: msg,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return users.filter((u) => {
      const uRole = (u.roles?.[0] || "USER") as "USER" | "HOST" | "ADMIN";
      const status = u.isActive ? "active" : "inactive";
      const phone = u.phoneNumber?.toLowerCase() ?? "";

      const matchesSearch =
        !q ||
        u.email.toLowerCase().includes(q) ||
        phone.includes(q);

      const matchesRole = roleFilter === "all" || uRole === roleFilter;
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const handleOpenUserModal = (user?: User) => {
    setSelectedUser(user || null);
    setOpenUserModal(true);
  };

  const handleUserSubmit = async (data: CreateUserDto) => {
    try {
      await createUser(data);
      toast({
        variant: "success",
        title: "Tạo người dùng thành công",
        description: `Đã thêm ${data.email} vào hệ thống.`,
      });
      setOpenUserModal(false);
      fetchUsers();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Tạo người dùng thất bại",
        description:
          err?.response?.data?.message || err?.message || "Vui lòng thử lại.",
      });
    }
  };

  const handleDelete = async (id: number, email?: string) => {
    await handleDeleteEntity(
      `người dùng ${email ?? `#${id}`}`,
      () => deleteUser(id),
      () => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-warm-900">
            Quản lý người dùng
          </h1>
          <p className="text-warm-600 mt-1">Quản lý tài khoản khách hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchUsers}>
            Làm mới
          </Button>
          <Button onClick={() => handleOpenUserModal()}>
            <Plus className="w-4 h-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <Card className="p-4 border-warm-2 00">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-warm-200"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-warm-600" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="px-3 py-2 border border-warm-200 rounded-lg bg-white text-sm text-warm-900"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="USER">Khách hàng</option>
              <option value="HOST">Chủ nhà</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-warm-200 rounded-lg bg-white text-sm text-warm-900"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </Card>

      {loading && (
        <Card className="p-6 border-warm-200">
          <p>Đang tải danh sách người dùng...</p>
        </Card>
      )}
      {error && !loading && (
        <Card className="p-6 border-red-200 bg-red-50 text-red-700">
          <p>Lỗi tải dữ liệu: {error}</p>
        </Card>
      )}

      {!loading && !error && (
        <Card className="overflow-hidden border-warm-200">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-warm-200 bg-warm-50">
                  <th className="text-center py-4 px-4 font-semibold text-warm-900">
                    Avatar
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-warm-900">
                    Email
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-warm-900">
                    Số điện thoại
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-warm-900">
                    Vai trò
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-warm-900">
                    Ngày tham gia
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-warm-900">
                    Trạng thái
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-warm-900">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => {
                  const role = (u.roles?.[0] || "USER").toUpperCase() as
                    | "USER"
                    | "HOST"
                    | "ADMIN";
                  const status = u.isActive ? "active" : "inactive";
                  const createdAt = formatDate(u.createdAt);

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-warm-100 hover:bg-warm-50 transition-colors align-middle"
                    >
                      <td className="py-2">
                        <div className="flex justify-center items-center">
                          <UserAvatar
                            avatarUrl={u.avatar}
                            fullName={u.email}
                            size="lg"
                          />
                        </div>
                      </td>
                      <td className="py-4 px-4 text-warm-700">{u.email}</td>
                      <td className="py-4 px-4 text-warm-700">
                        {u.phoneNumber ?? "–"}
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getRoleColor(role)}>
                          {role === "USER"
                            ? "Khách hàng"
                            : role === "HOST"
                            ? "Chủ nhà"
                            : "Quản trị viên"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-warm-700">{createdAt}</td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(status)}>
                          {status === "active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2 justify-start">
                          <Link href={`/admin/users/${u.id}`}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-warm-600 hover:text-warm-700"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(u.id, u.email)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-warm-600">
                      Không có người dùng nào phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <UserCreateModal
        open={openUserModal}
        onOpenChange={setOpenUserModal}
        onSubmit={handleUserSubmit}
      />
    </div>
  );
}
