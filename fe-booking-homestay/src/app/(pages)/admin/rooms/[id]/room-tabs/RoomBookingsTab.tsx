import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Booking } from "@/types/room";
import { Baby, CalendarDays, Mail, Phone, UserRound } from "lucide-react";
import React from "react";

interface RoomBookingsTabProps {
  bookings: Booking[];
  formatDate: (date?: string | Date | null) => string;
}

const RoomBookingsTab: React.FC<RoomBookingsTabProps> = ({
  bookings,
  formatDate,
}) => {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-bold text-warm-900 mb-4 border-b pb-2">
        Danh sách đặt phòng
      </h3>
      {bookings.length ? (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-3 px-4 text-left font-semibold text-warm-700">
                  Khách hàng
                </th>
                <th className="py-3 px-4 text-left font-semibold text-warm-700">
                  Sức chứa
                </th>
                <th className="py-3 px-4 text-left font-semibold text-warm-700">
                  Check-in
                </th>
                <th className="py-3 px-4 text-left font-semibold text-warm-700">
                  Check-out
                </th>
                <th className="py-3 px-4 text-left font-semibold text-warm-700">
                  Tổng tiền
                </th>
                <th className="py-3 px-4 text-left font-semibold text-warm-700">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b last:border-b-0 hover:bg-muted/30 transition"
                >
                  {/* CỘT KHÁCH HÀNG */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-warm-900">
                      {b.user?.name || "Ẩn danh"}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" /> {b.user?.email || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" />{" "}
                      {b.user?.phoneNumber || "N/A"}
                    </p>
                  </td>
                  {/* CỘT SỨC CHỨA */}
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex flex-col gap-1">
                      <span className="flex items-center gap-1 text-warm-700">
                        <UserRound className="w-3.5 h-3.5" /> {b.adults} NL
                      </span>
                      {b.children > 0 && (
                        <span className="flex items-center gap-1 text-warm-700">
                          <Baby className="w-3.5 h-3.5" /> {b.children} TE
                        </span>
                      )}
                    </div>
                  </td>
                  {/* CỘT CHECK-IN: SỬ DỤNG formatDate */}
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                      {formatDate(b.checkIn)}
                    </div>
                  </td>
                  {/* CỘT CHECK-OUT: SỬ DỤNG formatDate */}
                  <td className="py-3 px-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CalendarDays className="w-3.5 h-3.5 text-primary" />
                      {formatDate(b.checkOut)}
                    </div>
                  </td>
                  {/* CỘT TỔNG TIỀN */}
                  <td className="py-3 px-4 font-bold text-primary">
                    {b.totalAmount
                      ? b.totalAmount.toLocaleString() + "₫"
                      : "N/A"}
                  </td>
                  {/* CỘT TRẠNG THÁI */}
                  <td className="py-3 px-4">
                    <Badge
                      className={`font-semibold ${
                        ["CONFIRMED", "CHECKED_IN", "CHECKED_OUT"].includes(
                          b.status
                        )
                          ? "bg-green-100 text-green-700 border border-green-200 hover:bg-green-100"
                          : b.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200 hover:bg-yellow-100"
                          : "bg-red-100 text-red-700 border border-red-200 hover:bg-red-100"
                      }`}
                    >
                      {b.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-muted-foreground text-center py-8">
          Chưa có lịch đặt phòng nào.
        </p>
      )}
    </Card>
  );
};

export default RoomBookingsTab;
