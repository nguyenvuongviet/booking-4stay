"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserAvatar } from "@/components/UserAvatar";
import {
  getAllUserLoyalty,
  getLoyaltyLevels,
  LoyaltyLevel,
  LoyaltyUserProgram,
} from "@/services/admin/loyaltyApi";
import { ChevronDown, ChevronRight, ChevronUp, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "../../_components/Pagination";

type SortOrder = "asc" | "desc" | null;

export default function LoyaltyUsersTab({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const [users, setUsers] = useState<LoyaltyUserProgram[]>([]);
  const [levels, setLevels] = useState<LoyaltyLevel[]>([]);
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");

  const [sortPoints, setSortPoints] = useState<SortOrder>(null);
  const [sortBookings, setSortBookings] = useState<SortOrder>(null);
  const [sortNights, setSortNights] = useState<SortOrder>(null);

  const pageSize = 8;
  const [page, setPage] = useState(1);

  const load = async () => {
    try {
      const [usersRes, levelsRes] = await Promise.all([
        getAllUserLoyalty(),
        getLoyaltyLevels(),
      ]);

      setUsers(usersRes);
      setLevels(levelsRes);
    } catch {
      toast.error("Không thể tải dữ liệu loyalty");
    }
  };

  useEffect(() => {
    load();
  }, [refreshKey]);

  useEffect(() => {
    setPage(1);
  }, [keyword, levelFilter, sortPoints, sortBookings, sortNights]);

  const levelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case "BRONZE":
        return "bg-amber-100 text-amber-800";
      case "SILVER":
        return "bg-gray-200 text-gray-700";
      case "GOLD":
        return "bg-yellow-200 text-yellow-800";
      case "PLATINUM":
        return "bg-blue-200 text-blue-800";
      case "DIAMOND":
        return "bg-sky-300 text-sky-900";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const toggleSort = (setter: (v: SortOrder) => void, value: SortOrder) => {
    if (value === null) setter("asc");
    else if (value === "asc") setter("desc");
    else setter(null);
  };

  const sortedIcon = (order: SortOrder) => {
    if (order === "asc") return <ChevronUp className="w-4 h-4" />;
    if (order === "desc") return <ChevronDown className="w-4 h-4" />;
    return <ChevronUp className="w-4 h-4 opacity-20" />;
  };

  const filtered = useMemo(() => {
    let data = [...users];
    const kw = keyword.trim().toLowerCase();

    data = data.filter((u) => {
      const fullName = `${u.user.firstName} ${u.user.lastName}`.toLowerCase();

      const matchesKeyword =
        !kw ||
        u.user.email.toLowerCase().includes(kw) ||
        fullName.includes(kw) ||
        u.level.toLowerCase().includes(kw);

      const matchesLevel =
        levelFilter === "ALL" || u.level.toUpperCase() === levelFilter;

      return matchesKeyword && matchesLevel;
    });
    if (sortPoints) {
      data.sort((a, b) =>
        sortPoints === "asc" ? a.points - b.points : b.points - a.points
      );
    }
    if (sortBookings) {
      data.sort((a, b) =>
        sortBookings === "asc"
          ? a.totalBookings - b.totalBookings
          : b.totalBookings - a.totalBookings
      );
    }
    if (sortNights) {
      data.sort((a, b) =>
        sortNights === "asc"
          ? a.totalNights - b.totalNights
          : b.totalNights - a.totalNights
      );
    }

    return data;
  }, [users, keyword, levelFilter, sortPoints, sortBookings, sortNights]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <Card className="p-6 rounded-xl shadow-sm space-y-6">
      <p className="text-base text-muted-foreground mt-1">
        Danh sách cấp độ khách hàng thân thiết.
      </p>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 text-gray-400" />
          <Input
            className="pl-10 rounded-lg"
            placeholder="Tìm email / tên / cấp độ..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="h-10 px-3 border rounded-lg text-sm bg-white shadow-sm"
        >
          <option value="ALL">Tất cả cấp độ</option>
          {levels.map((lv) => (
            <option key={lv.id} value={lv.name.toUpperCase()}>
              {lv.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="py-3 px-4 font-medium text-gray-700">User</th>
              <th className="py-3 px-4 font-medium text-gray-700">Level</th>

              <th
                className="py-3 px-4 font-medium text-gray-700 cursor-pointer"
                onClick={() => toggleSort(setSortPoints, sortPoints)}
              >
                <div className="flex items-center gap-1">
                  Điểm {sortedIcon(sortPoints)}
                </div>
              </th>

              <th
                className="py-3 px-4 font-medium text-gray-700 text-center cursor-pointer"
                onClick={() => toggleSort(setSortBookings, sortBookings)}
              >
                <div className="flex items-center justify-center gap-1">
                  Tổng booking {sortedIcon(sortBookings)}
                </div>
              </th>

              <th
                className="py-3 px-4 font-medium text-gray-700 text-center cursor-pointer"
                onClick={() => toggleSort(setSortNights, sortNights)}
              >
                <div className="flex items-center justify-center gap-1">
                  Số đêm {sortedIcon(sortNights)}
                </div>
              </th>

              <th className="py-3 px-4 w-10"></th>
            </tr>
          </thead>

          <tbody>
            {paged.map((u) => (
              <tr
                key={u.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar
                      avatarUrl={u.user.avatar}
                      fullName={u.user.email}
                      size="lg"
                    />
                    <div>
                      <div className="font-medium">{u.user.email}</div>
                      <div className="text-xs text-gray-500">
                        {u.user.firstName} {u.user.lastName}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <Badge className={levelColor(u.level)}>{u.level}</Badge>
                </td>

                <td className="py-4 px-4 font-semibold">
                  {u.points.toLocaleString()}
                </td>
                <td className="py-4 px-4 text-center">{u.totalBookings}</td>
                <td className="py-4 px-4 text-center">{u.totalNights}</td>

                <td className="py-4 px-4 text-center">
                  <Link href={`/admin/users/${u.user.id}`}>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="hover:bg-gray-200"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-500">
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="px-4 pb-4">
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      </div>
    </Card>
  );
}
