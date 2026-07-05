"use client";

import { Badge } from "@/_components/ui/badge";
import { Input } from "@/_components/ui/input";
import { Skeleton } from "@/_components/ui/skeleton";
import { UserAvatar } from "@/_components/UserAvatar";
import {
  getAllUserLoyalty,
  getLoyaltyLevels,
  LoyaltyLevel,
  LoyaltyUserProgram,
} from "@/services/admin/loyaltyApi";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Pagination } from "../../_components/Pagination";
type SortOrder = "asc" | "desc" | null;

export default function LoyaltyUsersTab({
  refreshKey,
}: {
  refreshKey: number;
}) {
  const router = useRouter();
  const [users, setUsers] = useState<LoyaltyUserProgram[]>([]);
  const [levels, setLevels] = useState<LoyaltyLevel[]>([]);
  const [keyword, setKeyword] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [sortPoints, setSortPoints] = useState<SortOrder>(null);
  const [sortBookings, setSortBookings] = useState<SortOrder>(null);
  const [sortNights, setSortNights] = useState<SortOrder>(null);

  const pageSize = 6;
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, levelsRes] = await Promise.all([
        getAllUserLoyalty(),
        getLoyaltyLevels(),
      ]);

      setUsers(usersRes);
      setLevels(levelsRes);
    } catch {
      toast.error("Không thể tải dữ liệu loyalty");
    } finally {
      setLoading(false);
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
        u.level.name.toLowerCase().includes(kw);

      const matchesLevel =
        levelFilter === "ALL" || u.level.name.toUpperCase() === levelFilter;

      return matchesKeyword && matchesLevel;
    });
    if (sortPoints) {
      data.sort((a, b) =>
        sortPoints === "asc" ? a.points - b.points : b.points - a.points,
      );
    }
    if (sortBookings) {
      data.sort((a, b) =>
        sortBookings === "asc"
          ? a.totalBookings - b.totalBookings
          : b.totalBookings - a.totalBookings,
      );
    }
    if (sortNights) {
      data.sort((a, b) =>
        sortNights === "asc"
          ? a.totalNights - b.totalNights
          : b.totalNights - a.totalNights,
      );
    }

    return data;
  }, [users, keyword, levelFilter, sortPoints, sortBookings, sortNights]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="sticky top-16 sm:top-20 z-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3.5 sm:p-5 rounded-2xl shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        <p className="text-xs sm:text-base font-medium text-slate-800">
          Danh sách cấp độ khách hàng thân thiết.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              className="pl-10 rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus:border-primary focus:ring-1 focus:ring-primary shadow-xs transition-all placeholder:text-slate-400 text-xs sm:text-sm h-9 sm:h-10"
              placeholder="Tìm email / tên / cấp độ..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="h-9 sm:h-10 px-3 border border-slate-300 rounded-lg text-xs sm:text-sm bg-white shadow-xs hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all cursor-pointer"
          >
            <option value="ALL">Tất cả cấp độ</option>
            {levels.map((lv) => (
              <option key={lv.id} value={lv.name.toUpperCase()}>
                {lv.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ==================== Desktop Table (lg+) ==================== */}
      <div className="hidden lg:block overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50 text-left">
              <th className="py-3 px-4 font-medium text-gray-700">User</th>
              <th className="py-3 px-4 font-medium text-gray-700">Level</th>
              <th className="py-3 px-4 font-medium text-gray-700">Quyền lợi</th>
              <th className="py-3 px-4 font-medium text-gray-700">
                Ngày thăng cấp
              </th>

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
            </tr>
          </thead>

          <tbody>
            {loading &&
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-32 rounded" />
                        <Skeleton className="h-3 w-20 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-5 w-16 rounded" />
                  </td>
                  <td className="py-4 px-4 space-y-1">
                    <Skeleton className="h-4 w-12 rounded" />
                    <Skeleton className="h-3 w-20 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-3.5 w-16 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-12 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-8 mx-auto rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <Skeleton className="h-4 w-8 mx-auto rounded" />
                  </td>
                </tr>
              ))}

            {!loading &&
              paged.map((u) => (
                <tr
                  key={u.id}
                  className="border-b hover:bg-primary/5 hover:text-slate-900 transition-colors cursor-pointer"
                  onClick={() => router.push(`/admin/users/${u.user.id}`)}
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
                    <Badge className={levelColor(u.level.name)}>
                      {u.level.name}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-primary">
                      Giảm {u.level.discountPercent}%
                    </div>
                    <div className="text-[10px] text-gray-400">
                      Tối đa{" "}
                      {Number(u.level.maxDiscountAmount).toLocaleString(
                        "vi-VN",
                      )}
                      đ
                    </div>
                  </td>
                  <td className="py-4 px-4 text-gray-500 text-xs">
                    {u.lastUpgradeDate
                      ? new Intl.DateTimeFormat("vi-VN").format(
                          new Date(u.lastUpgradeDate),
                        )
                      : "—"}
                  </td>
                  <td className="py-4 px-4 font-semibold">
                    {Number(u.points).toLocaleString("vi-VN")}
                  </td>
                  <td className="py-4 px-4 text-center">{u.totalBookings}</td>
                  <td className="py-4 px-4 text-center">{u.totalNights}</td>
                </tr>
              ))}

            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-500">
                  Không tìm thấy người dùng phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!loading && (
          <div className="px-4 pb-4">
            <Pagination
              page={page}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      {/* ==================== Mobile Cards Layout (<lg) ==================== */}
      <div className="lg:hidden space-y-3">
        {loading &&
          [...Array(3)].map((_, i) => (
            <div
              key={i}
              className="border rounded-xl p-4 bg-white shadow-xs space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
                <Skeleton className="h-5 w-16 rounded shrink-0" />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border">
                <div className="space-y-1">
                  <Skeleton className="h-3 w-12 rounded" />
                  <Skeleton className="h-4 w-20 rounded" />
                </div>
                <div className="space-y-1">
                  <Skeleton className="h-3 w-16 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="space-y-1 flex flex-col items-center">
                  <Skeleton className="h-2 w-8 rounded animate-pulse" />
                  <Skeleton className="h-4 w-12 rounded animate-pulse" />
                </div>
                <div className="space-y-1 flex flex-col items-center">
                  <Skeleton className="h-2 w-12 rounded animate-pulse" />
                  <Skeleton className="h-4 w-8 rounded animate-pulse" />
                </div>
                <div className="space-y-1 flex flex-col items-center">
                  <Skeleton className="h-2 w-10 rounded animate-pulse" />
                  <Skeleton className="h-4 w-8 rounded animate-pulse" />
                </div>
              </div>
            </div>
          ))}

        {!loading &&
          paged.map((u) => (
            <div
              key={u.id}
              onClick={() => router.push(`/admin/users/${u.user.id}`)}
              className="border rounded-xl p-4 bg-white shadow-xs space-y-3 cursor-pointer hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <UserAvatar
                  avatarUrl={u.user.avatar}
                  fullName={u.user.email}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800 text-sm truncate">
                    {u.user.email}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {u.user.firstName} {u.user.lastName}
                  </div>
                </div>
                <Badge className={`${levelColor(u.level.name)} shrink-0`}>
                  {u.level.name}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border">
                <div>
                  <span className="text-muted-foreground block">
                    Quyền lợi:
                  </span>
                  <span className="font-semibold text-primary">
                    Giảm {u.level.discountPercent}%
                  </span>
                  <span className="text-[10px] text-gray-400 block">
                    Tối đa{" "}
                    {Number(u.level.maxDiscountAmount).toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block">
                    Ngày thăng cấp:
                  </span>
                  <span className="font-semibold text-slate-700">
                    {u.lastUpgradeDate
                      ? new Intl.DateTimeFormat("vi-VN").format(
                          new Date(u.lastUpgradeDate),
                        )
                      : "—"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Điểm
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {Number(u.points).toLocaleString("vi-VN")}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Bookings
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {u.totalBookings}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Số đêm
                  </span>
                  <span className="font-bold text-slate-800 text-sm">
                    {u.totalNights}
                  </span>
                </div>
              </div>
            </div>
          ))}

        {!loading && filtered.length === 0 && (
          <div className="border rounded-xl p-8 text-center text-muted-foreground bg-white">
            Không tìm thấy người dùng phù hợp.
          </div>
        )}

        <div className="pt-2">
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={setPage}
          />
        </div>
      </div>
    </div>
  );
}
