import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { IUser } from "@/models/User";
import { BookingStatus } from "@/types/booking";
import { format } from "date-fns";
import { DollarSign, Gift, History, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { BookingStatusBadge } from "../../booking/_component/BookingStatusBadge";

interface Props {
  user: IUser | null;
  bookings: Booking[];
  getTierPoints: (point: number) => number;
}

export default function RewardsTab({ user, bookings, getTierPoints }: Props) {
  const { t } = useLang();
  const router = useRouter();
  if (!user) return null;

  const totalPoints = user?.loyalty_program.totalPoint || 0;
  const remainingPoints = getTierPoints(totalPoints);
  const goalPoints = totalPoints + remainingPoints;
  const progressPercentage =
    goalPoints > 0 ? (totalPoints / goalPoints) * 100 : 100;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl elegant-heading  dark:text-white">
            {t("my_rewards")}
          </h2>
          <p className="text-slate-500 text-sm mt-1 hidden sm:block">
            Theo dõi điểm thưởng và quyền lợi thành viên của bạn.
          </p>
        </div>
        <button
          onClick={() => router.push("/loyalty-program")}
          className="text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Gift className="w-4 h-4" />
          <span className="hidden sm:inline">Chính sách điểm thưởng</span>
          <span className="sm:hidden">Chi tiết</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card className="border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-800/50 group cursor-pointer overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
            <Gift className="h-24 w-24 text-primary" />
          </div>
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-500 uppercase text-sm">
                Tổng điểm
              </h3>
              <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                {user?.loyalty_program.totalPoint || 0}
              </p>
              <p className="mt-1 text-xs text-slate-400 tracking-wider">
                Điểm đã tích luỹ
              </p>
            </div>
          </div>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-800/50 group cursor-pointer overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
            <TrendingUp className="h-24 w-24 text-orange-600" />
          </div>
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl group-hover:scale-110 group-hover:bg-orange-200 dark:group-hover:bg-orange-900/50 transition-all duration-300">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 w-full">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-slate-500 uppercase text-sm">
                    Hạng thành viên
                  </h3>
                  <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {user?.loyalty_program.levels.name || "Bronze"}
                  </p>
                  {/* <p className="mt-1 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    {remainingPoints > 0 ? "Tiến trình lên hạng" : "Đã đạt hạng tối đa"}
                  </p> */}
                </div>
              </div>

              {/* {remainingPoints > 0 && (
                <div className="mt-4 w-full pr-4">
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-500 rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-slate-400 font-medium px-0.5">
                    <span>{totalPoints}</span>
                    <span>{goalPoints}</span>
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </Card>

        <Card className="border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-800/50 group cursor-pointer overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-150 transition-transform duration-500">
            <DollarSign className="h-24 w-24 text-emerald-600" />
          </div>
          <div className="relative flex items-start gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl group-hover:scale-110 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-all duration-300">
              <DollarSign className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-500 uppercase text-sm">
                Ưu đãi hiện tại
              </h3>
              <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                {user?.loyalty_program.levels.discountPercent || 0}%
              </p>
              <p className="mt-1 text-xs text-slate-400 tracking-wider">
                Giảm tối đa:{" "}
                {user?.loyalty_program.levels.maxDiscountAmount || 0}đ
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rewards History Table */}
      <div className="flex items-center gap-2 mb-6">
        <History className="h-5 w-5 text-slate-400" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
          Lịch sử điểm thưởng
        </h3>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-900">
        {bookings.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-full mb-4">
              <Gift className="h-8 w-8 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">
              Chưa có lịch sử điểm thưởng
            </p>
            <p className="text-sm text-slate-400 mt-1">
              Hãy đặt phòng để bắt đầu tích điểm!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Ngày
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Điểm
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bookings.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                    onClick={() => router.push(`/booking/${b.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                      {format(new Date(b.createdAt), "dd/MM/yyyy")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-primary transition-colors">
                      {b.room?.name || "Đặt phòng"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          b.totalAmount / 1000 > 0
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {b.totalAmount / 1000 > 0 ? "+" : ""}
                        {b.totalAmount / 1000} pts
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <BookingStatusBadge status={b.status as BookingStatus} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
