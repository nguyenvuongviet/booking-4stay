"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Mail,
  Phone,
  Eye,
  Edit2,
  Trash2,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { UserFormModal } from "@/components/admin/user-form-modal";

const users = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "+84 901 234 567",
    role: "user",
    bookings: 5,
    joined: "2024-01-15",
    status: "active",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "+84 912 345 678",
    role: "host",
    bookings: 3,
    joined: "2024-02-20",
    status: "active",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    phone: "+84 923 456 789",
    role: "user",
    bookings: 8,
    joined: "2023-12-10",
    status: "active",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    phone: "+84 934 567 890",
    role: "user",
    bookings: 2,
    joined: "2024-03-05",
    status: "inactive",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    phone: "+84 945 678 901",
    role: "admin",
    bookings: 1,
    joined: "2024-03-15",
    status: "active",
  },
];

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [openUserModal, setOpenUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus =
      statusFilter === "all" || user.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleOpenUserModal = (user?: any) => {
    setSelectedUser(user || null);
    setOpenUserModal(true);
  };

  const handleUserSubmit = (data: any) => {
    console.log("User data:", data);
    // Handle user creation/update
  };

  const getStatusColor = (status: string) => {
    return status === "active"
      ? "bg-green-100 text-green-800"
      : "bg-gray-100 text-gray-800";
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "host":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-warm-100 text-warm-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-warm-900">
            Quản lý người dùng
          </h1>
          <p className="text-warm-600 mt-1">Quản lý tài khoản khách hàng</p>
        </div>
        <Button
          onClick={() => handleOpenUserModal()}
          className="bg-warm-700 hover:bg-warm-800 gap-2"
        >
          <Plus className="w-4 h-4" />
          Thêm người dùng
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 border-warm-200">
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
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-warm-200 rounded-lg bg-white text-sm text-warm-900"
            >
              <option value="all">Tất cả vai trò</option>
              <option value="user">Khách hàng</option>
              <option value="host">Chủ nhà</option>
              <option value="admin">Quản trị viên</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-warm-200 rounded-lg bg-white text-sm text-warm-900"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden border-warm-200">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-warm-200 bg-warm-50">
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Tên
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Email
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Số điện thoại
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Vai trò
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Lượt đặt
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Ngày tham gia
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Trạng thái
                </th>
                <th className="text-left py-4 px-6 font-semibold text-warm-900">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-warm-100 hover:bg-warm-50 transition-colors"
                >
                  <td className="py-4 px-6 font-medium text-warm-900">
                    {user.name}
                  </td>
                  <td className="py-4 px-6 flex items-center gap-2 text-warm-700">
                    <Mail className="w-4 h-4 text-warm-400" />
                    {user.email}
                  </td>
                  <td className="py-4 px-6 flex items-center gap-2 text-warm-700">
                    <Phone className="w-4 h-4 text-warm-400" />
                    {user.phone}
                  </td>
                  <td className="py-4 px-6">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role === "user" && "Khách hàng"}
                      {user.role === "host" && "Chủ nhà"}
                      {user.role === "admin" && "Quản trị viên"}
                    </Badge>
                  </td>
                  <td className="py-4 px-6 text-warm-700">{user.bookings}</td>
                  <td className="py-4 px-6 text-warm-700">{user.joined}</td>
                  <td className="py-4 px-6">
                    <Badge className={getStatusColor(user.status)}>
                      {user.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </Badge>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <Link href={`/admin/users/${user.id}`}>
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
                        onClick={() => handleOpenUserModal(user)}
                        className="text-warm-600 hover:text-warm-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* User Form Modal */}
      <UserFormModal
        open={openUserModal}
        onOpenChange={setOpenUserModal}
        user={selectedUser}
        onSubmit={handleUserSubmit}
      />
    </div>
  );
}
