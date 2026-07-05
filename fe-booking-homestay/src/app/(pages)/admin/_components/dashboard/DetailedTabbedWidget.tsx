"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { getImageUrl } from "@/_helper/chat.helper";
import { Eye, Home, Star } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface BookingItem {
  id: number;
  userName: string;
  userAvatar: string | null;
  roomName: string;
  total: number;
  status: string;
  checkIn: string;
  checkOut: string;
  createdAt: string;
}

interface ReviewItem {
  id: number;
  userName: string;
  avatar: string | null;
  roomName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface RoomItem {
  roomId: number;
  roomName: string;
  rating: number;
  imageUrl: string | null;
  bookings: number;
  revenue: number;
}

interface DetailedTabbedWidgetProps {
  recentBookings: BookingItem[];
  recentReviews: ReviewItem[];
  topRooms: RoomItem[];
  statusColors: Record<string, { label: string; color: string }>;
}

export function DetailedTabbedWidget({
  recentBookings,
  recentReviews,
  topRooms,
  statusColors,
}: DetailedTabbedWidgetProps) {
  const [activeTab, setActiveTab] = useState<"bookings" | "reviews" | "rooms">(
    "bookings",
  );

  const getStatusBadge = (status: string) => {
    const config = statusColors[status] || { label: status, color: "#6b7280" };
    return (
      <span
        className="px-2.5 py-1 text-xs font-semibold rounded-full border"
        style={{
          backgroundColor: config.color + "12",
          color: config.color,
          borderColor: config.color + "30",
        }}
      >
        {config.label}
      </span>
    );
  };

  return (
    <section className="bg-white/55 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl shadow-slate-100/50 p-6">
      {/* Tab Navigator */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-slate-100 pb-4 mb-6">
        <div className="flex gap-2">
          {[
            {
              id: "bookings",
              label: "Đơn đặt gần đây",
              count: recentBookings.length,
            },
            {
              id: "reviews",
              label: "Đánh giá mới nhất",
              count: recentReviews.length,
            },
            {
              id: "rooms",
              label: "Top phòng hiệu suất",
              count: topRooms.length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white shadow-md shadow-slate-950/20"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {tab.label}
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          Cập nhật lúc: {new Date().toLocaleTimeString()}
        </span>
      </div>

      {/* Tab Content 1: Bookings */}
      {activeTab === "bookings" && (
        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Khách hàng</th>
                <th className="py-3 px-4">Tên Homestay</th>
                <th className="py-3 px-4">Check-in / Check-out</th>
                <th className="py-3 px-4 text-right">Tổng thanh toán</th>
                <th className="py-3 px-4 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentBookings.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-slate-50/30 transition-colors"
                >
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    #{b.id}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {b.userAvatar && getImageUrl(b.userAvatar) ? (
                        <img
                          src={getImageUrl(b.userAvatar) || ""}
                          alt={b.userName}
                          onError={(e) => {
                            e.currentTarget.src = "/default-avatar.png";
                          }}
                          className="w-7 h-7 rounded-full object-cover border border-slate-100"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center text-[10px]">
                          {b.userName.slice(0, 1)}
                        </div>
                      )}
                      <span className="font-semibold text-slate-700">
                        {b.userName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-600">
                    {b.roomName}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {new Date(b.checkIn).toLocaleDateString("vi-VN")} -{" "}
                    {new Date(b.checkOut).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    {b.total.toLocaleString()} ₫
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(b.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Link href={`/admin/bookings/${b.id}`}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-10 text-center text-slate-400 italic"
                  >
                    Chưa có đơn đặt phòng nào phát sinh gần đây.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab Content 2: Reviews */}
      {activeTab === "reviews" && (
        <div className="space-y-4">
          {recentReviews.map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors flex gap-4"
            >
              {r.avatar && getImageUrl(r.avatar) ? (
                <img
                  src={getImageUrl(r.avatar) || ""}
                  alt={r.userName}
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                  className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-100"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 font-bold flex items-center justify-center shrink-0 text-xs">
                  {r.userName.slice(0, 1)}
                </div>
              )}

              <div className="flex-1 space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                  <div>
                    <span className="font-bold text-slate-800 text-sm">
                      {r.userName}
                    </span>
                    <span className="text-slate-400 text-xs font-medium ml-2">
                      đã đánh giá phòng
                    </span>
                    <span className="text-sky-600 text-xs font-bold ml-1">
                      {r.roomName}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < Math.round(r.rating)
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-200"
                        }`}
                      />
                    ))}
                    <span className="text-xs font-bold text-slate-700 ml-1">
                      ({r.rating.toFixed(1)})
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50/50 p-2.5 rounded-lg border border-slate-50/55 italic leading-relaxed">
                  "{r.comment || "Không có nội dung nhận xét viết kèm."}"
                </p>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                  <span>Đánh giá từ hóa đơn đặt phòng liên kết</span>
                  <span>{new Date(r.createdAt).toLocaleString("vi-VN")}</span>
                </div>
              </div>
            </div>
          ))}
          {recentReviews.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic text-xs">
              Chưa nhận được phản hồi, đánh giá nào từ khách hàng.
            </div>
          )}
        </div>
      )}

      {/* Tab Content 3: Top Performing Rooms */}
      {activeTab === "rooms" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRooms.map((room, i) => (
            <Link
              key={room.roomId}
              href={`/admin/rooms/${room.roomId}`}
              className="group block"
            >
              <Card className="rounded-xl overflow-hidden border border-slate-100 hover:shadow-lg transition-all group-hover:scale-[1.01] duration-300">
                <div className="relative h-40 bg-slate-100 overflow-hidden">
                  {room.imageUrl && getImageUrl(room.imageUrl) ? (
                    <img
                      src={getImageUrl(room.imageUrl) || ""}
                      alt={room.roomName}
                      onError={(e) => {
                        e.currentTarget.src = "/default.jpg";
                      }}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Home className="w-10 h-10" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md">
                    TOP {i + 1}
                  </span>
                </div>

                <div className="p-4 space-y-3">
                  <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-sky-600 transition-colors">
                    {room.roomName}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {room.bookings} lượt đặt đơn
                    </span>
                    <div className="flex items-center gap-0.5">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-slate-700">
                        {room.rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-50 flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Tổng doanh thu
                    </span>
                    <span className="font-extrabold text-sm text-emerald-600">
                      {room.revenue.toLocaleString()} ₫
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
          {topRooms.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 italic text-xs">
              Không có dữ liệu homestay phổ biến
            </div>
          )}
        </div>
      )}
    </section>
  );
}
