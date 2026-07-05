"use client";

import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UrgentActionCenterProps {
  pendingConfirmationCount: number;
  waitingRefundCount: number;
  partiallyPaidCount: number;
}

export function UrgentActionCenter({
  pendingConfirmationCount,
  waitingRefundCount,
  partiallyPaidCount,
}: UrgentActionCenterProps) {
  const tasks = [
    {
      title: "Đặt phòng chờ duyệt & thanh toán",
      count: pendingConfirmationCount,
      desc: "Các giao dịch đặt phòng chưa được thanh toán hoặc xác nhận giữ phòng.",
      badgeColor: "bg-orange-100 text-orange-700",
      action: "Xem danh sách duyệt",
      link: "/admin/bookings?status=PENDING",
      alert: pendingConfirmationCount > 0,
    },
    {
      title: "Yêu cầu hoàn trả tiền cọc",
      count: waitingRefundCount,
      desc: "Khách hàng đã hủy phòng hợp lệ và đang chờ hệ thống đối soát hoàn trả tiền.",
      badgeColor: "bg-purple-100 text-purple-700",
      action: "Giải quyết hoàn tiền",
      link: "/admin/bookings?status=WAITING_REFUND",
      alert: waitingRefundCount > 0,
    },
    {
      title: "Đơn cọc thanh toán một phần",
      count: partiallyPaidCount,
      desc: "Các booking mới chỉ thanh toán trả trước một phần và cần theo dõi thu nốt khi check-in.",
      badgeColor: "bg-yellow-100 text-yellow-700",
      action: "Kiểm tra thanh toán",
      link: "/admin/bookings?status=PARTIALLY_PAID",
      alert: false,
    },
  ];

  return (
    <Card className="p-4 sm:p-6 bg-white/70 backdrop-blur-md rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/50 flex flex-col h-full">
      <div className="flex items-center gap-2 mb-2 sm:mb-4">
        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500" />
        <h2 className="text-base sm:text-lg font-bold text-slate-800">
          Trung tâm xử lý khẩn cấp (PMS)
        </h2>
      </div>
      <p className="text-[11px] sm:text-xs text-muted-foreground mb-3 sm:mb-6 leading-relaxed">
        Các tác vụ đặt phòng và thanh toán cần phê duyệt hoặc xử lý ngay từ phía
        quản trị viên.
      </p>

      <div className="space-y-3 sm:space-y-4">
        {tasks.map((task, idx) => (
          <div
            key={idx}
            className={`p-3 sm:p-4 rounded-xl border flex flex-col md:flex-row justify-between md:items-center gap-3 sm:gap-4 transition-all ${
              task.alert
                ? "border-rose-100 bg-rose-50/20 hover:bg-rose-50/40"
                : "border-slate-100 bg-slate-50/20 hover:bg-slate-50/40"
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-800 text-xs sm:text-sm">
                  {task.title}
                </span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] sm:text-xs font-bold rounded-md ${task.badgeColor}`}
                >
                  {task.count}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                {task.desc}
              </p>
            </div>
            <Link href={task.link} className="shrink-0">
              <Button
                size="sm"
                variant={task.alert ? "destructive" : "outline"}
                className="text-[11px] sm:text-xs h-8 sm:h-9 flex items-center gap-1 cursor-pointer"
              >
                {task.action}
                <ArrowRight className="w-3 h-3" />
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </Card>
  );
}
