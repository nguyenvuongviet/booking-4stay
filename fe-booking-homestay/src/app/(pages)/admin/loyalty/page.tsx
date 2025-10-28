"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Gift,
  TrendingUp,
} from "lucide-react";

const loyaltyMembers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@email.com",
    tier: "Gold",
    points: 5000,
    bookings: 15,
    totalSpent: "$4,500",
    joinDate: "2024-01-15",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@email.com",
    tier: "Silver",
    points: 2500,
    bookings: 8,
    totalSpent: "$2,100",
    joinDate: "2024-03-20",
  },
  {
    id: 3,
    name: "Lê Minh C",
    email: "leminc@email.com",
    tier: "Bronze",
    points: 1200,
    bookings: 4,
    totalSpent: "$1,200",
    joinDate: "2024-06-10",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@email.com",
    tier: "Gold",
    points: 6800,
    bookings: 22,
    totalSpent: "$6,200",
    joinDate: "2023-11-05",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    email: "hoangvane@email.com",
    tier: "Silver",
    points: 3200,
    bookings: 10,
    totalSpent: "$2,800",
    joinDate: "2024-02-28",
  },
];

const tierBenefits = [
  { tier: "Bronze", discount: "5%", freeNights: 0, priority: false },
  { tier: "Silver", discount: "10%", freeNights: 1, priority: true },
  { tier: "Gold", discount: "15%", freeNights: 2, priority: true },
  { tier: "Platinum", discount: "20%", freeNights: 3, priority: true },
];

export default function LoyaltyPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Chương trình khách hàng thân thiết
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý chương trình loyalty và thành viên
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          Thêm thành viên
        </Button>
      </div>

      {/* Loyalty Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng thành viên</p>
              <p className="text-3xl font-bold mt-2">1,234</p>
            </div>
            <Gift className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Thành viên Gold</p>
              <p className="text-3xl font-bold mt-2">234</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Điểm được phát hành
              </p>
              <p className="text-3xl font-bold mt-2">2.5M</p>
            </div>
            <Gift className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Doanh thu từ loyalty
              </p>
              <p className="text-3xl font-bold mt-2">$125K</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary/50" />
          </div>
        </Card>
      </div>

      {/* Tier Benefits */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Quyền lợi theo cấp độ</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold">Cấp độ</th>
                <th className="text-left py-3 px-4 font-semibold">Giảm giá</th>
                <th className="text-left py-3 px-4 font-semibold">
                  Đêm miễn phí
                </th>
                <th className="text-left py-3 px-4 font-semibold">Ưu tiên</th>
              </tr>
            </thead>
            <tbody>
              {tierBenefits.map((benefit) => (
                <tr
                  key={benefit.tier}
                  className="border-b border-border hover:bg-muted/30"
                >
                  <td className="py-3 px-4 font-medium">{benefit.tier}</td>
                  <td className="py-3 px-4">{benefit.discount}</td>
                  <td className="py-3 px-4">{benefit.freeNights} đêm</td>
                  <td className="py-3 px-4">{benefit.priority ? "✓" : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4 flex-wrap items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Tìm kiếm thành viên..." className="pl-10" />
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select className="px-3 py-2 border border-border rounded-lg bg-card text-sm">
              <option>Tất cả cấp độ</option>
              <option>Bronze</option>
              <option>Silver</option>
              <option>Gold</option>
              <option>Platinum</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Members Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 font-semibold">
                  Tên thành viên
                </th>
                <th className="text-left py-4 px-6 font-semibold">Email</th>
                <th className="text-left py-4 px-6 font-semibold">Cấp độ</th>
                <th className="text-left py-4 px-6 font-semibold">Điểm</th>
                <th className="text-left py-4 px-6 font-semibold">Lượt đặt</th>
                <th className="text-left py-4 px-6 font-semibold">
                  Tổng chi tiêu
                </th>
                <th className="text-left py-4 px-6 font-semibold">
                  Ngày tham gia
                </th>
                <th className="text-left py-4 px-6 font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loyaltyMembers.map((member) => (
                <tr
                  key={member.id}
                  className="border-b border-border hover:bg-muted/30 transition-colors"
                >
                  <td className="py-4 px-6 font-medium">{member.name}</td>
                  <td className="py-4 px-6 text-xs">{member.email}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        member.tier === "Gold"
                          ? "bg-yellow-100 text-yellow-800"
                          : member.tier === "Silver"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {member.tier}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-semibold">{member.points}</td>
                  <td className="py-4 px-6">{member.bookings}</td>
                  <td className="py-4 px-6">{member.totalSpent}</td>
                  <td className="py-4 px-6 text-xs">{member.joinDate}</td>
                  <td className="py-4 px-6">
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-muted rounded transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-muted rounded transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-destructive/10 rounded transition-colors">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
