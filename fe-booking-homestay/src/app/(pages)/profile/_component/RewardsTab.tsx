"use client";

import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { IUser } from "@/models/User";
import { get_booking } from "@/services/bookingApi";
import { getPublicLoyaltyLevels, LoyaltyLevel } from "@/services/loyaltyApi";
import { BookingStatus } from "@/types/booking";
import { format } from "date-fns";
import {
  Award,
  ChevronLeft,
  ChevronRight,
  Crown,
  Gem,
  Gift,
  History,
  Loader2,
  Medal,
  Percent,
  Trophy,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { BookingStatusBadge } from "../../booking/_component/BookingStatusBadge";

interface Props {
  user: IUser | null;
  isActive: boolean;
}

export default function RewardsTab({ user, isActive }: Props) {
  const { t } = useLang();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const [rewardsView, setRewardsView] = useState<"overview" | "policy">(
    "overview",
  );
  const [levels, setLevels] = useState<LoyaltyLevel[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  // Local booking history state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  // Fetch dynamic levels on mount
  useEffect(() => {
    const fetchLevels = async () => {
      setLoadingLevels(true);
      try {
        const data = await getPublicLoyaltyLevels();
        setLevels(data);
      } catch (error) {
        console.error("Failed to fetch loyalty levels", error);
      } finally {
        setLoadingLevels(false);
      }
    };
    fetchLevels();
  }, []);

  // Fetch bookings local logic
  const fetchBookings = useCallback(async (pageNumber: number) => {
    setBookingsLoading(true);
    try {
      // Using pageSize 6 for rewards history table
      const res = await get_booking({ page: pageNumber, pageSize: 6 });
      setBookings(res.bookings || []);
      setTotalPages(Math.ceil(res.total / 6));
      setTotalCount(res.total || 0);
    } catch (err) {
      console.error("Fetch rewards booking history error:", err);
    } finally {
      setBookingsLoading(false);
    }
  }, []);

  // Fetch bookings when active or page changes
  useEffect(() => {
    if (isActive && rewardsView === "overview") {
      fetchBookings(page);
    }
  }, [isActive, rewardsView, page, fetchBookings]);

  // Reset page when switching tabs or view
  useEffect(() => {
    if (!isActive) {
      setPage(1);
    }
  }, [isActive]);

  const handlePageChange = (newPage: number) => {
    if (newPage === page || bookingsLoading) return;
    setPage(newPage);

    // Smooth scroll back to top of container with sticky header offset
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({
        top: rect.top + scrollTop - 100,
        behavior: "smooth",
      });
    }
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (page <= 3) {
        pageNumbers.push(1, 2, 3, 4, "...", totalPages);
      } else if (page >= totalPages - 2) {
        pageNumbers.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pageNumbers.push(1, "...", page - 1, page, page + 1, "...", totalPages);
      }
    }
    return pageNumbers;
  };

  if (!user) return null;

  const totalPoints = user?.loyalty_program.totalPoint || 0;

  const getTierProgress = (total: number) => {
    if (levels.length === 0) {
      return { percentage: 0, min: 0, max: 0, nextTier: "", remaining: 0 };
    }

    const sorted = [...levels].sort((a, b) => a.minPoints - b.minPoints);

    const currentName = user?.loyalty_program?.levels?.name || "";
    let currentIdx = sorted.findIndex(
      (l) => l.name.toUpperCase() === currentName.toUpperCase(),
    );

    if (currentIdx === -1) {
      currentIdx = sorted.reduce((acc, lvl, idx) => {
        if (total >= lvl.minPoints) {
          return idx;
        }
        return acc;
      }, 0);
    }

    const currentLevel = sorted[currentIdx];
    const hasNext = currentIdx < sorted.length - 1;
    const nextLevel = hasNext ? sorted[currentIdx + 1] : null;

    const formatTierName = (name: string) => {
      if (!name) return "";
      return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    };

    if (!nextLevel) {
      return {
        percentage: 100,
        min: currentLevel?.minPoints || 0,
        max: total,
        nextTier: "Tối đa",
        remaining: 0,
      };
    }

    const min = currentLevel?.minPoints || 0;
    const max = nextLevel.minPoints;
    const remaining = max - total;
    const percentage =
      max - min > 0
        ? Math.min(100, Math.max(0, ((total - min) / (max - min)) * 100))
        : 100;

    return {
      percentage,
      min,
      max,
      nextTier: formatTierName(nextLevel.name),
      remaining: Math.max(0, remaining),
    };
  };

  const tierProgress = getTierProgress(totalPoints);
  const remainingPoints = tierProgress.remaining;

  const getLevelColor = (levelName: string) => {
    switch (levelName.toUpperCase()) {
      case "BRONZE":
        return "text-amber-700 dark:text-amber-400";
      case "SILVER":
        return "text-slate-600 dark:text-slate-400";
      case "GOLD":
        return "text-yellow-655 dark:text-yellow-550";
      case "PLATINUM":
        return "text-blue-600 dark:text-blue-400";
      case "DIAMOND":
        return "text-sky-650 dark:text-sky-400";
      default:
        return "text-primary";
    }
  };

  const getLevelIcon = (levelName: string) => {
    switch (levelName.toUpperCase()) {
      case "BRONZE":
        return <Medal className="w-5 h-5 text-amber-700 dark:text-amber-500" />;
      case "SILVER":
        return <Medal className="w-5 h-5 text-slate-500 dark:text-slate-400" />;
      case "GOLD":
        return (
          <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
        );
      case "PLATINUM":
        return <Crown className="w-5 h-5 text-blue-500 fill-blue-500/10" />;
      case "DIAMOND":
        return <Gem className="w-5 h-5 text-sky-500 fill-sky-500/10" />;
      default:
        return <Gift className="w-5 h-5 text-primary" />;
    }
  };

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-slate-900 p-4 sm:p-6 md:p-8 rounded-3xl border border-slate-100 dark:border-slate-800/80 shadow-xs animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      {/* Header with Sub-tabs */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center mb-6 md:mb-8 gap-4 border-b border-slate-100/80 dark:border-slate-800/60 pb-5">
        <div className="text-left">
          <h2 className="text-xl sm:text-2xl md:text-3xl elegant-heading dark:text-white">
            {t("my_rewards")}
          </h2>
          <p className="text-slate-500 text-[10px] sm:text-xs md:text-sm mt-1">
            Theo dõi điểm thưởng và quyền lợi thành viên của bạn.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex bg-slate-50 dark:bg-slate-800/40 p-1 rounded-xl gap-1 self-start lg:self-auto border border-slate-100 dark:border-slate-850/50">
          <button
            onClick={() => setRewardsView("overview")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
              rewardsView === "overview"
                ? "bg-white dark:bg-slate-800 text-primary shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Tổng quan & Lịch sử
          </button>
          <button
            onClick={() => setRewardsView("policy")}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-bold rounded-lg transition-all cursor-pointer ${
              rewardsView === "policy"
                ? "bg-white dark:bg-slate-800 text-primary shadow-xs"
                : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Chính sách & Cấp độ
          </button>
        </div>
      </div>

      {rewardsView === "overview" ? (
        <>
          {/* Stats Cards - Responsive 2-cols on tablet (sm:grid-cols-2) and 3-cols on desktop (lg:grid-cols-3) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-8 md:mb-10">
            <Card className="border border-slate-100 dark:border-slate-800/80 p-4 sm:p-5 rounded-3xl shadow-xs hover:shadow-md transition-all bg-slate-50/30 dark:bg-slate-900/40 group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-500 pointer-events-none">
                <Award className="h-16 w-16 sm:h-20 sm:w-20 text-primary" />
              </div>
              <div className="relative flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-primary/10 rounded-xl group-hover:scale-105 group-hover:bg-primary/20 transition-all duration-300">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-400 dark:text-slate-500 uppercase text-[9px] sm:text-[11px] tracking-wider">
                    Tổng điểm
                  </h3>
                  <p className="mt-1 text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {user?.loyalty_program.totalPoint || 0}
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400">
                    Điểm đã tích luỹ
                  </p>
                </div>
              </div>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800/80 p-4 sm:p-5 rounded-3xl shadow-xs hover:shadow-md transition-all bg-slate-50/30 dark:bg-slate-900/40 group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-500 pointer-events-none">
                <Crown className="h-16 w-16 sm:h-20 sm:w-20 text-orange-600" />
              </div>
              <div className="relative flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-950/20 rounded-xl group-hover:scale-105 group-hover:bg-orange-200 dark:group-hover:bg-orange-950/40 transition-all duration-300">
                  <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-400 dark:text-slate-500 uppercase text-[9px] sm:text-[11px] tracking-wider">
                    Hạng thành viên
                  </h3>
                  <p className="mt-1 text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {user?.loyalty_program.levels.name || "Bronze"}
                  </p>

                  {/* Glowing progress bar */}
                  {remainingPoints > 0 ? (
                    <div className="mt-2.5 w-full">
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-orange-400 to-orange-500 rounded-full transition-all duration-500"
                          style={{
                            width: `${getTierProgress(totalPoints).percentage}%`,
                          }}
                        />
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 font-medium truncate">
                        Cần thêm {remainingPoints.toLocaleString()} điểm để lên{" "}
                        {getTierProgress(totalPoints).nextTier}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[9px] sm:text-[10px] text-emerald-600 dark:text-emerald-400 mt-2.5 font-bold uppercase tracking-wider">
                      Đã đạt mức hạng tối đa
                    </p>
                  )}
                </div>
              </div>
            </Card>

            <Card className="border border-slate-100 dark:border-slate-800/80 p-4 sm:p-5 rounded-3xl shadow-xs hover:shadow-md transition-all bg-slate-50/30 dark:bg-slate-900/40 group overflow-hidden relative sm:col-span-2 lg:col-span-1">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-500 pointer-events-none">
                <Percent className="h-16 w-16 sm:h-20 sm:w-20 text-emerald-600" />
              </div>
              <div className="relative flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-950/20 rounded-xl group-hover:scale-105 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-950/40 transition-all duration-300">
                  <Percent className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-400 dark:text-slate-500 uppercase text-[9px] sm:text-[11px] tracking-wider">
                    Ưu đãi hiện tại
                  </h3>
                  <p className="mt-1 text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {user?.loyalty_program.levels.discountPercent || 0}%
                  </p>
                  <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400 truncate">
                    Giảm tối đa:{" "}
                    {Number(
                      user?.loyalty_program.levels.maxDiscountAmount || 0,
                    ).toLocaleString("vi-VN")}
                    đ
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Rewards History Table */}
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <History className="h-5 w-5 text-slate-400" />
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-slate-105">
              Lịch sử điểm thưởng
            </h3>
          </div>

          <div className="rounded-3xl border border-slate-100 dark:border-slate-800/80 overflow-hidden shadow-xs bg-white dark:bg-slate-900 relative">
            {bookingsLoading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center backdrop-blur-xs">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

            {bookings.length === 0 ? (
              <div className="py-12 sm:py-16 text-center flex flex-col items-center px-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-full mb-3 text-slate-400">
                  <Gift className="h-6 w-6" />
                </div>
                <p className="text-slate-500 font-semibold text-xs sm:text-sm">
                  Chưa có lịch sử điểm thưởng
                </p>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
                  Hãy đặt phòng để bắt đầu tích luỹ điểm thưởng ngay!
                </p>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/80">
                      <tr>
                        <th className="px-4 py-3 sm:px-5 sm:py-3.5 text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Ngày
                        </th>
                        <th className="px-4 py-3 sm:px-5 sm:py-3.5 text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Mô tả
                        </th>
                        <th className="px-4 py-3 sm:px-5 sm:py-3.5 text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Điểm
                        </th>
                        <th className="px-4 py-3 sm:px-5 sm:py-3.5 text-[9px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                          Trạng thái
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                      {bookings.map((b) => (
                        <tr
                          key={b.id}
                          className="hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer"
                          onClick={() => router.push(`/booking/${b.id}`)}
                        >
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                            {format(new Date(b.createdAt), "dd/MM/yyyy")}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 text-[10px] sm:text-xs font-semibold text-slate-900 dark:text-slate-205 group-hover:text-primary transition-colors max-w-30 sm:max-w-xs truncate">
                            {b.room?.name || "Đặt phòng"}
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 sm:px-2 rounded text-[10px] sm:text-[11px] font-bold ${
                                b.totalAmount / 1000 > 0
                                  ? "bg-emerald-50 text-emerald-750 dark:bg-emerald-950/20 dark:text-emerald-450"
                                  : "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                              }`}
                            >
                              {b.totalAmount / 1000 > 0 ? "+" : ""}
                              {b.totalAmount / 1000} pts
                            </span>
                          </td>
                          <td className="px-4 py-3 sm:px-5 sm:py-4 whitespace-nowrap">
                            <BookingStatusBadge
                              status={b.status as BookingStatus}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modern responsive page-number pagination controls */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-4 sm:px-5 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/20 dark:bg-slate-900/20">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium order-2 sm:order-1">
                      Hiển thị trang {page} / {totalPages} (tổng số {totalCount}{" "}
                      giao dịch)
                    </span>

                    <div className="flex items-center gap-1 sm:gap-1.5 order-1 sm:order-2">
                      <button
                        onClick={() => handlePageChange(Math.max(1, page - 1))}
                        disabled={page === 1 || bookingsLoading}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-805 text-[11px] font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                      >
                        <ChevronLeft size={13} />
                        <span className="hidden sm:inline">Trước</span>
                      </button>

                      {getPageNumbers().map((num, idx) => {
                        if (num === "...") {
                          return (
                            <span
                              key={`ellipsis-${idx}`}
                              className="w-7 h-7 flex items-center justify-center text-slate-400 text-xs"
                            >
                              &hellip;
                            </span>
                          );
                        }

                        const pageNum = num as number;
                        const isCurrent = pageNum === page;

                        return (
                          <button
                            key={`page-${pageNum}`}
                            onClick={() => handlePageChange(pageNum)}
                            disabled={bookingsLoading}
                            className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? "bg-primary text-primary-foreground shadow-xs shadow-primary/20 scale-105"
                                : "border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() =>
                          handlePageChange(Math.min(totalPages, page + 1))
                        }
                        disabled={page === totalPages || bookingsLoading}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-650 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300 cursor-pointer"
                      >
                        <span className="hidden sm:inline">Sau</span>
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Policy & Tiers Page content */}
          <div className="text-center sm:text-left mb-6 pb-2">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100">
              Các cấp độ thành viên & đặc quyền
            </h3>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-1">
              Tích luỹ điểm thưởng từ các chuyến đặt phòng để thăng hạng và nhận
              ưu đãi giảm giá độc quyền.
            </p>
          </div>

          {loadingLevels ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {levels.map((level) => {
                const isUserLevel =
                  user.loyalty_program.levels.name.toUpperCase() ===
                  level.name.toUpperCase();
                return (
                  <Card
                    key={level.id}
                    className={`p-4 sm:p-5 border rounded-3xl shadow-xs relative overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-1 bg-white dark:bg-slate-900 ${
                      isUserLevel
                        ? "border-primary ring-2 ring-primary/10 dark:border-primary"
                        : "border-slate-100 dark:border-slate-800/80"
                    }`}
                  >
                    {/* Active Level Badge */}
                    {isUserLevel && (
                      <span className="absolute top-2 right-2 bg-primary text-white text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider shadow-xs">
                        Hạng hiện tại
                      </span>
                    )}

                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 sm:p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100/50 dark:border-slate-800/40">
                          {getLevelIcon(level.name)}
                        </div>
                        <h4
                          className={`text-base sm:text-lg font-bold ${getLevelColor(level.name)}`}
                        >
                          {level.name}
                        </h4>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
                            Điều kiện
                          </p>
                          <p className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-150">
                            {level.minPoints.toLocaleString("vi-VN")}{" "}
                            <span className="text-[10px] sm:text-xs font-medium text-slate-400">
                              điểm
                            </span>
                          </p>
                        </div>

                        <div className="bg-slate-50/55 dark:bg-slate-800/20 p-3 sm:p-3.5 rounded-2xl border border-slate-100/30 dark:border-slate-800/40 shadow-inner">
                          <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                            Ưu đãi giảm giá
                          </p>
                          <div className="flex items-baseline gap-1">
                            <span
                              className={`text-xl sm:text-2xl font-black ${getLevelColor(level.name)}`}
                            >
                              {level.discountPercent}%
                            </span>
                            <span className="text-[9px] sm:text-[10px] font-semibold text-slate-505">
                              / hóa đơn
                            </span>
                          </div>
                          {Number(level.maxDiscountAmount) > 0 && (
                            <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-800/40">
                              Giảm tối đa:{" "}
                              <strong className="text-slate-700 dark:text-slate-350">
                                {Number(level.maxDiscountAmount).toLocaleString(
                                  "vi-VN",
                                )}
                                đ
                              </strong>
                            </p>
                          )}
                        </div>

                        {level.description && (
                          <p className="text-slate-500 leading-relaxed text-[11px] sm:text-xs">
                            {level.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
