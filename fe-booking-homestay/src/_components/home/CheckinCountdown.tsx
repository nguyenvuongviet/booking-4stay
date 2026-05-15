"use client";

import { useAuth } from "@/context/auth-context";
import { Booking } from "@/models/Booking";
import { get_booking } from "@/services/bookingApi";
import { differenceInDays, differenceInHours, format, isPast } from "date-fns";
import { vi } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  ChevronRight,
  Clock,
  CreditCard,
  MapPin,
  Plane,
  RefreshCw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function CheckinCountdown() {
  const { user } = useAuth();
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [actionNeeded, setActionNeeded] = useState<Booking[]>([]);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!user || hasFetched.current) return;
    hasFetched.current = true;

    (async () => {
      try {
        const data = await get_booking({ page: 1, pageSize: 20 });
        const now = new Date();
        const allBookings: Booking[] = data.bookings || [];

        // 1. Booking cần hành động: PENDING (chờ thanh toán) hoặc WAITING_REFUND
        const needsAction = allBookings.filter((b) =>
          ["PENDING", "WAITING_REFUND"].includes(b.status),
        );
        setActionNeeded(needsAction.slice(0, 3));

        // 2. Booking sắp tới: CONFIRMED/PARTIALLY_PAID trong 14 ngày
        const upcomingBookings = allBookings.filter((b) => {
          const isActive = ["CONFIRMED", "PARTIALLY_PAID"].includes(b.status);
          const checkInDate = new Date(b.checkIn);
          const checkOutDate = new Date(b.checkOut);
          return (
            isActive &&
            !isPast(checkOutDate) &&
            differenceInDays(checkInDate, now) <= 14
          );
        });

        upcomingBookings.sort(
          (a, b) =>
            new Date(a.checkIn).getTime() - new Date(b.checkIn).getTime(),
        );
        setUpcoming(upcomingBookings.slice(0, 3));
      } catch (err) {
        console.error("Error fetching upcoming bookings:", err);
      }
    })();
  }, [user]);

  if (!user || (upcoming.length === 0 && actionNeeded.length === 0))
    return null;

  return (
    <section className="py-6 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
        {/* === Action Needed Alerts === */}
        {actionNeeded.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            {actionNeeded.map((booking) => (
              <ActionAlert key={booking.id} booking={booking} />
            ))}
          </motion.div>
        )}

        {/* === Upcoming Trips === */}
        {upcoming.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plane size={18} className="text-primary" />
                <h3 className="font-bold text-foreground">
                  Chuyến đi sắp tới của bạn
                </h3>
              </div>
              <Link
                href="/booking/"
                className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
              >
                Xem tất cả <ChevronRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcoming.map((booking) => (
                <CountdownCard key={booking.id} booking={booking} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ==============================
 * Action Alert — PENDING / WAITING_REFUND
 * ============================== */
function ActionAlert({ booking }: { booking: Booking }) {
  const isPending = booking.status === "PENDING";

  const config = isPending
    ? {
        icon: <CreditCard size={16} className="shrink-0" />,
        bg: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
        iconBg: "bg-amber-100 dark:bg-amber-900/50",
        textColor: "text-amber-800 dark:text-amber-200",
        title: "Đang chờ thanh toán",
        description: `${booking.room?.name} — ${booking.totalAmount?.toLocaleString()} VND`,
        cta: "Thanh toán ngay",
        ctaColor: "bg-amber-500 hover:bg-amber-600 text-white",
      }
    : {
        icon: <RefreshCw size={16} className="shrink-0" />,
        bg: "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
        iconBg: "bg-orange-100 dark:bg-orange-900/50",
        textColor: "text-orange-800 dark:text-orange-200",
        title: "Đang chờ hoàn tiền",
        description: `${booking.room?.name} — ${(booking.refundAmount || 0).toLocaleString()} VND`,
        cta: "Xem chi tiết",
        ctaColor: "bg-orange-500 hover:bg-orange-600 text-white",
      };

  return (
    <Link href={`/booking/${booking.id}`}>
      <div
        className={`flex items-center gap-4 px-4 py-3 rounded-xl border ${config.bg} cursor-pointer hover:shadow-md transition-all`}
      >
        <div
          className={`w-8 h-8 rounded-full ${config.iconBg} ${config.textColor} flex items-center justify-center`}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-bold ${config.textColor}`}>
            {config.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {config.description}
          </p>
        </div>
        <span
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold ${config.ctaColor} transition-colors`}
        >
          {config.cta}
        </span>
      </div>
    </Link>
  );
}

function CountdownCard({ booking }: { booking: Booking }) {
  const checkInDate = new Date(booking.checkIn);
  const checkOutDate = new Date(booking.checkOut);
  const now = new Date();

  const isStaying = isPast(checkInDate) && !isPast(checkOutDate);
  const daysLeft = differenceInDays(checkInDate, now);
  const hoursLeft = differenceInHours(checkInDate, now);

  const getCountdownText = () => {
    if (isStaying) return "Đang lưu trú";
    if (daysLeft === 0) return `Còn ${hoursLeft} giờ`;
    if (daysLeft === 1) return "Ngày mai!";
    return `Còn ${daysLeft} ngày`;
  };

  const getCountdownColor = () => {
    if (isStaying) return "bg-emerald-500";
    if (daysLeft <= 1) return "bg-red-500";
    if (daysLeft <= 3) return "bg-orange-500";
    return "bg-primary";
  };

  return (
    <Link href={`/booking/${booking.id}`}>
      <motion.div
        whileHover={{ y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.12)" }}
        className="relative overflow-hidden rounded-2xl border border-border bg-white dark:bg-slate-900 shadow-sm cursor-pointer transition-all"
      >
        {/* Countdown badge */}
        <div
          className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-white text-xs font-bold ${getCountdownColor()}`}
        >
          <Clock size={12} className="inline mr-1" />
          {getCountdownText()}
        </div>

        {/* Room image */}
        <div className="relative h-32 overflow-hidden">
          <Image
            src={booking.room?.images?.main || "/default.jpg"}
            alt={booking.room?.name || "Room"}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 left-3 text-white">
            <h4 className="font-bold text-sm line-clamp-1">
              {booking.room?.name}
            </h4>
            <p className="text-[11px] opacity-80 flex items-center gap-1">
              <MapPin size={10} />
              {booking.room?.location?.province || ""}
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <CalendarCheck size={13} />
              <span>
                {format(checkInDate, "dd MMM", { locale: vi })} →{" "}
                {format(checkOutDate, "dd MMM", { locale: vi })}
              </span>
            </div>
            <span className="font-bold text-foreground">
              {booking.totalAmount?.toLocaleString()} VND
            </span>
          </div>

          {/* Progress bar for staying */}
          {isStaying && (
            <div className="space-y-1">
              <div className="h-1.5 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.min(
                      100,
                      ((now.getTime() - checkInDate.getTime()) /
                        (checkOutDate.getTime() - checkInDate.getTime())) *
                        100,
                    )}%`,
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
              <p className="text-[10px] text-emerald-600 font-medium">
                Checkout {format(checkOutDate, "EEEE, dd/MM", { locale: vi })}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
