import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { Booking, BookingStatus } from "@/models/Booking";
import { IUser } from "@/models/User";
import { format } from "date-fns";
import { CalendarX, DollarSign, Gift, TrendingUp } from "lucide-react";
import { BookingStatusBadge } from "../../booking/_component/BookingStatusBadge";


interface Props {
  user: IUser | null;
  bookings: Booking[];
  getTierPoints: (point: number) => number;
}

export default function RewardsTab({
  user,
  bookings,
  getTierPoints,
}: Props) {
  const { t } = useLang();
  if (!user) return null;

  return (
    <div className="mt-2 px-16 py-8 rounded-xl space-y-4 bg-card ">
      <h2 className="text-3xl elegant-sans">{t("my_rewards")}</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 p-8 shadow-md hover:shadow-xl transition-all bg-accent/50 group cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-linear-to-br from-accent to-primary/90 rounded-xl group-hover:scale-110 transition-transform">
              <Gift className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="elegant-sans text-muted-foreground text-sm">
                Total Points
              </h3>
              <p className="mt-3 text-4xl elegant-sans text-secondary-foreground">
                {user?.loyalty_program.totalPoint || 0}
              </p>
              <p className="mt-2 text-xs text-muted">Points earned</p>
            </div>
          </div>
        </Card>

        <Card className="border-0 p-8 shadow-md hover:shadow-xl transition-all bg-linear-to-br from-orange-50 to-red-50 group cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-linear-to-br from-secondary to-secondary/50 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="h-6 w-6 text-orange-700" />
            </div>
            <div className="flex-1">
              <h3 className="elegant-sans text-muted-foreground text-sm">
                Tier Points
              </h3>
              <p className="mt-3 text-4xl elegant-sans text-orange-700">
                {getTierPoints(user?.loyalty_program.totalPoint || 0)}
              </p>
              <p className="mt-2 text-xs text-muted">
                Towards next tier
              </p>
            </div>
          </div>
        </Card>

        <Card className="border-0 p-8 shadow-md hover:shadow-xl transition-all bg-linear-to-br from-green-50 to-emerald-50 group cursor-pointer">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-linear-to-br from-green-100 to-emerald-200 rounded-xl group-hover:scale-110 transition-transform">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
            <div className="flex-1">
              <h3 className="elegant-sans text-muted-foreground text-sm">
                Cashback
              </h3>
              <p className="mt-3 text-4xl elegant-sans text-green-700">
                0 đ
              </p>
              <p className="mt-2 text-xs text-muted">
                Available to redeem
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Rewards History Table */}
      <h3 className="text-2xl elegant-sans mb-6 mt-10">Lịch sử điểm thưởng </h3>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 overflow-hidden shadow-md">
        {bookings.length === 0 ? (
          <div className="py-16 text-center text-muted">
            <CalendarX className="mx-auto h-12 w-12 mb-4" />
            No bookings yet
          </div>
        ) : (
          <table className="w-full border rounded-xl overflow-hidden">
            <thead className="bg-linear-to-r from-slate-100 to-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm elegant-sans">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-sm elegant-sans">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold">
                  Points
                </th>
                <th className="px-6 py-4 text-left text-sm elegant-sans">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-muted-foreground">{format(b.createdAt, "dd/MM/yyyy")}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground elegant-sans">{b.room?.name}</td>
                  <td className="px-6 py-4 text-sm elegant-sans">
                    <span
                      className={`${b.totalAmount / 1000 > 0
                        ? "text-blue-600"
                        : "text-red-600"
                        }`}
                    >{b.totalAmount / 1000 > 0 ? "+" : ""}{b.totalAmount / 1000}</span></td>
                  <td className="p-4">
                    <BookingStatusBadge status={b.status as BookingStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
