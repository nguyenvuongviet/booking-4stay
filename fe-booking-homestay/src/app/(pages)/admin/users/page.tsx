"use client";

import { Badge } from "@/_components/ui/badge";
import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { useToast } from "@/_components/ui/use-toast";
import { UserAvatar } from "@/_components/UserAvatar";
import { UserCreateModal } from "@/app/(pages)/admin/users/_components/UserCreateModal";
import { formatDate } from "@/lib/utils/date";
import { handleDeleteEntity } from "@/lib/utils/handleDelete";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "@/services/admin/usersApi";
import type { CreateUserDto, User } from "@/types/user";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Filter,
  Lock,
  Plus,
  Search,
  Trash2,
  Unlock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Pagination } from "../_components/Pagination";
import { RefreshButton } from "../_components/RefreshButton";

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
  const router = useRouter();
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

  const [sortBy, setSortBy] = useState<"createdAt" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const toggleSort = (column: "createdAt") => {
    if (sortBy !== column) {
      setSortBy(column);
      setSortOrder("desc");
    } else {
      if (sortOrder === "desc") {
        setSortOrder("asc");
      } else if (sortOrder === "asc") {
        setSortBy(null);
        setSortOrder(null);
      } else {
        setSortOrder("desc");
      }
    }
  };

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
    let data = users.filter((u) => {
      const userRoles =
        u.roles && u.roles.length > 0
          ? u.roles.map((r) => r.toUpperCase())
          : ["USER"];
      const status = u.isActive ? "active" : "inactive";
      const phone = u.phoneNumber?.toLowerCase() ?? "";

      const matchesSearch =
        !q || u.email.toLowerCase().includes(q) || phone.includes(q);

      const matchesRole =
        roleFilter === "all" || userRoles.includes(roleFilter.toUpperCase());
      const matchesStatus = statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });

    if (sortBy === "createdAt" && sortOrder) {
      data.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      });
    }

    return data;
  }, [users, searchTerm, roleFilter, statusFilter, sortBy, sortOrder]);

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
      },
    );
  };

  const handleToggleActive = async (user: User) => {
    const newStatus = !user.isActive;
    const actionName = newStatus ? "mở khóa" : "khóa";
    try {
      await updateUser(user.id, { isActive: newStatus });
      toast({
        variant: "success",
        title: `${newStatus ? "Mở khóa" : "Khóa"} tài khoản thành công`,
        description: `Tài khoản ${user.email} đã được ${actionName}.`,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u)),
      );
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: `Không thể ${actionName} tài khoản`,
        description:
          err?.response?.data?.message || err?.message || "Vui lòng thử lại.",
      });
    }
  };

  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  const pagedUsers = useMemo(() => {
    return filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  }, [filteredUsers, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <div>
          <h1 className="text-3xl font-bold text-warm-900">
            Quản lý người dùng
          </h1>
          <p className="text-warm-600 mt-1">Quản lý tài khoản khách hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <RefreshButton onRefresh={fetchUsers} />
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
              className="px-3 py-2 border border-warm-200 rounded-lg bg-white text-sm text-warm-900 cursor-pointer"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="USER">Khách hàng</option>
              <option value="HOST">Chủ nhà</option>
              <option value="ADMIN">Quản trị viên</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-warm-200 rounded-lg bg-white text-sm text-warm-900 cursor-pointer"
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
                  <th
                    className={`text-left py-4 px-4 font-semibold cursor-pointer transition-colors select-none hover:bg-warm-100 dark:hover:bg-warm-800 ${
                      sortBy === "createdAt"
                        ? "text-primary dark:text-sky-400 font-bold"
                        : "text-warm-900"
                    }`}
                    onClick={() => toggleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Ngày tham gia{" "}
                      {sortBy === "createdAt" && sortOrder === "asc" ? (
                        <ArrowUp className="w-4 h-4 text-primary dark:text-sky-400" />
                      ) : sortBy === "createdAt" && sortOrder === "desc" ? (
                        <ArrowDown className="w-4 h-4 text-primary dark:text-sky-400" />
                      ) : (
                        <ArrowUpDown className="w-4 h-4 text-warm-400" />
                      )}
                    </div>
                  </th>
                  <th className="text-left py-4 px-4 font-semibold text-warm-900">
                    Trạng thái
                  </th>
                  <th className="text-center py-4 px-4 font-semibold text-warm-900">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map((u) => {
                  const userRoles =
                    u.roles && u.roles.length > 0
                      ? u.roles.map((r) => r.toUpperCase())
                      : ["USER"];
                  const status = u.isActive ? "active" : "inactive";
                  const createdAt = formatDate(u.createdAt);

                  return (
                    <tr
                      key={u.id}
                      className="border-b border-warm-100 hover:bg-sky-100/50 dark:hover:bg-slate-800/80 hover:shadow-sm cursor-pointer transition-all duration-150 align-middle"
                      onClick={() => router.push(`/admin/users/${u.id}`)}
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
                        <div className="flex flex-wrap gap-1">
                          {userRoles.map((role) => (
                            <Badge key={role} className={getRoleColor(role)}>
                              {role === "USER"
                                ? "Khách hàng"
                                : role === "HOST"
                                  ? "Chủ nhà"
                                  : role === "ADMIN"
                                    ? "Quản trị viên"
                                    : role}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-warm-700">{createdAt}</td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(status)}>
                          {status === "active"
                            ? "Hoạt động"
                            : "Không hoạt động"}
                        </Badge>
                      </td>
                      <td
                        className="py-4 px-4 text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(u)}
                            className={`transition-all duration-150 active:scale-95 cursor-pointer ${
                              u.isActive
                                ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                                : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                            }`}
                            title={
                              u.isActive
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                          >
                            {u.isActive ? (
                              <Unlock className="w-4 h-4" />
                            ) : (
                              <Lock className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(u.id, u.email)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-150 active:scale-95 cursor-pointer"
                            title="Xóa tài khoản"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {pagedUsers.length === 0 && (
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

      {!loading && !error && filteredUsers.length > 0 && (
        <Pagination page={page} pageCount={pageCount} onPageChange={setPage} />
      )}

      <UserCreateModal
        open={openUserModal}
        onOpenChange={setOpenUserModal}
        onSubmit={handleUserSubmit}
      />
    </div>
  );
}
