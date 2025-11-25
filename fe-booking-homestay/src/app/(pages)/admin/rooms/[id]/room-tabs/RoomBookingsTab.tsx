"use client";

import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils/date";

export default function RoomBookingsTab({ bookings }: { bookings: any[] }) {
  if (!bookings.length)
    return (
      <Card className="p-6">
        <p className="text-muted-foreground text-center">
          Chưa có lịch đặt phòng nào.
        </p>
      </Card>
    );

  return (
    <Card className="p-0 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/40">
          <tr>
            <th className="table-head">Khách</th>
            <th className="table-head">Check-in</th>
            <th className="table-head">Check-out</th>
            <th className="table-head">Tổng tiền</th>
            <th className="table-head">Trạng thái</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b.id} className="table-row">
              <td className="table-cell">{b.userName}</td>
              <td className="table-cell">{formatDate(b.checkIn)}</td>
              <td className="table-cell">{formatDate(b.checkOut)}</td>
              <td className="table-cell text-primary font-semibold">
                {b.totalAmount.toLocaleString()}₫
              </td>
              <td className="table-cell">
                <span className="status-badge">{b.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
