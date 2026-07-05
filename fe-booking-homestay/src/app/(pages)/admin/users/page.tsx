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
    ? "bg-green-100 text-green-800 dark:bg-emerald-950/30 dark:text-emerald-400"
    : "bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-400";
}

function getRoleColor(role: "USER" | "HOST" | "ADMIN" | string) {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 dark:bg-purple-950/30 dark:text-purple-400";
    case "HOST":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400";
    default:
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400";
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Quản lý người dùng
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Quản lý tài khoản khách hàng và chủ nhà
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <RefreshButton
            onRefresh={fetchUsers}
            label=""
            className="h-9 w-9 p-0 sm:w-auto sm:h-10 sm:px-4 sm:gap-2 cursor-pointer rounded-xl"
          />
          <Button
            onClick={() => handleOpenUserModal()}
            className="h-9 sm:h-10 text-xs sm:text-sm px-3 sm:px-4 text-white cursor-pointer shrink-0 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1 sm:mr-1.5" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      {/* Sticky Search & Filter Container */}
      <div className="sticky top-16 sm:top-20 z-20 -mx-4 px-4 py-3 sm:-mx-6 sm:px-6 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800 shadow-xs transition-all duration-300">
        <div className="p-3 sm:p-4 bg-card rounded-2xl border border-border/80 shadow-xs">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-11 w-full text-xs sm:text-sm bg-background dark:bg-slate-900 rounded-xl border border-border"
              />
            </div>

            {/* Select Filters */}
            <div className="flex items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="h-10 sm:h-11 flex-1 lg:w-44 lg:flex-none px-3 bg-background dark:bg-slate-900 border border-border rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer outline-none focus:border-primary"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="USER">Khách hàng</option>
                <option value="HOST">Chủ nhà</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="h-10 sm:h-11 flex-1 lg:w-44 lg:flex-none px-3 bg-background dark:bg-slate-900 border border-border rounded-xl text-xs sm:text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer outline-none focus:border-primary"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="inactive">Không hoạt động</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {/* Desktop Skeleton Table */}
          <div className="hidden lg:block border border-border rounded-2xl overflow-hidden bg-card shadow-xs">
            <div className="p-4 bg-slate-50 dark:bg-slate-850/40 border-b border-border h-12" />
            {Array.from({ length: 5 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 border-b border-border flex items-center justify-between gap-4 animate-pulse"
              >
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/6" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                <div className="flex gap-2 shrink-0">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet Card Skeletons */}
          <div className="lg:hidden space-y-3.5">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="p-4 bg-card rounded-2xl border border-border/80 shadow-xs flex flex-col gap-3.5 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-slate-200 dark:bg-slate-800 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800/40 pt-3">
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-2.5 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-3 mt-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                  <div className="flex gap-2">
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="w-8 h-8 bg-slate-200 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && !loading && (
        <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 rounded-2xl">
          <p>Lỗi tải dữ liệu: {error}</p>
        </Card>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <>
          {/* Desktop Table View (>= lg) */}
          <div className="hidden lg:block bg-card rounded-2xl border border-border overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-center py-4 px-4 font-semibold text-slate-800 dark:text-slate-250 w-24">
                      Avatar
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800 dark:text-slate-250">
                      Email
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800 dark:text-slate-250">
                      Số điện thoại
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800 dark:text-slate-250">
                      Vai trò
                    </th>
                    <th
                      className={`text-left py-4 px-4 font-semibold cursor-pointer transition-colors select-none hover:bg-slate-100 dark:hover:bg-slate-800/50 ${
                        sortBy === "createdAt"
                          ? "text-primary font-bold"
                          : "text-slate-800 dark:text-slate-250"
                      }`}
                      onClick={() => toggleSort("createdAt")}
                    >
                      <div className="flex items-center gap-1">
                        Ngày tham gia{" "}
                        {sortBy === "createdAt" && sortOrder === "asc" ? (
                          <ArrowUp className="w-4 h-4 text-primary" />
                        ) : sortBy === "createdAt" && sortOrder === "desc" ? (
                          <ArrowDown className="w-4 h-4 text-primary" />
                        ) : (
                          <ArrowUpDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-800 dark:text-slate-250">
                      Trạng thái
                    </th>
                    <th className="text-center py-4 px-4 font-semibold text-slate-800 dark:text-slate-250 w-28">
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
                        className="border-b border-border hover:bg-sky-50/40 dark:hover:bg-slate-800/60 hover:shadow-xs cursor-pointer transition-all duration-150 align-middle"
                        onClick={() => router.push(`/admin/users/${u.id}`)}
                      >
                        <td className="py-2.5">
                          <div className="flex justify-center items-center">
                            <UserAvatar
                              avatarUrl={u.avatar}
                              fullName={u.email}
                              size="lg"
                            />
                          </div>
                        </td>
                        <td className="py-4 px-4 text-slate-700 dark:text-slate-300 font-medium">
                          {u.email}
                        </td>
                        <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
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
                        <td className="py-4 px-4 text-slate-700 dark:text-slate-300">
                          {createdAt}
                        </td>
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
                          <div className="flex gap-1.5 justify-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(u)}
                              className={`h-8.5 w-8.5 rounded-lg border border-transparent transition-all duration-150 active:scale-95 cursor-pointer ${
                                u.isActive
                                  ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-100"
                                  : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-100"
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
                              className="h-8.5 w-8.5 text-red-650 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 border border-transparent hover:border-red-100 rounded-lg transition-all duration-150 active:scale-95 cursor-pointer"
                              title="Xóa tài khoản"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile/Tablet Card View (< lg) */}
          <div className="lg:hidden space-y-3.5">
            {pagedUsers.map((u) => {
              const userRoles =
                u.roles && u.roles.length > 0
                  ? u.roles.map((r) => r.toUpperCase())
                  : ["USER"];
              const status = u.isActive ? "active" : "inactive";
              const createdAt = formatDate(u.createdAt);

              return (
                <div
                  key={u.id}
                  onClick={() => router.push(`/admin/users/${u.id}`)}
                  className="p-4 bg-card rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs flex flex-col gap-3.5 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      avatarUrl={u.avatar}
                      fullName={u.email}
                      size="lg"
                      className="w-11 h-11 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-slate-200 truncate">
                        {u.email}
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {userRoles.map((role) => (
                          <Badge
                            key={role}
                            className={`${getRoleColor(role)} text-[10px] py-0.5 px-1.5`}
                          >
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
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 dark:border-slate-800/40 pt-3.5">
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                        Số điện thoại
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-350">
                        {u.phoneNumber ?? "–"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px] uppercase tracking-wider">
                        Ngày tham gia
                      </span>
                      <span className="font-medium text-slate-700 dark:text-slate-350">
                        {createdAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/40 pt-3.5 mt-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                        Trạng thái:
                      </span>
                      <Badge
                        className={`${getStatusColor(status)} text-[10px]`}
                      >
                        {status === "active" ? "Hoạt động" : "Không hoạt động"}
                      </Badge>
                    </div>

                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleToggleActive(u)}
                        className={`h-8 w-8 cursor-pointer rounded-lg border-border/80 ${
                          u.isActive
                            ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                            : "text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/30"
                        }`}
                        title={
                          u.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"
                        }
                      >
                        {u.isActive ? (
                          <Unlock className="w-3.5 h-3.5" />
                        ) : (
                          <Lock className="w-3.5 h-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(u.id, u.email)}
                        className="h-8 w-8 text-red-650 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg border-border/80 cursor-pointer"
                        title="Xóa tài khoản"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pagedUsers.length === 0 && (
            <div className="py-16 text-center text-slate-550 text-sm bg-card border border-border rounded-2xl shadow-xs">
              Không có người dùng nào phù hợp.
            </div>
          )}
        </>
      )}

      {/* Pagination */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="pt-2">
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      )}

      <UserCreateModal
        open={openUserModal}
        onOpenChange={setOpenUserModal}
        onSubmit={handleUserSubmit}
      />
    </div>
  );
}
