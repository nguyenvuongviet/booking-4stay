import { useLang } from "@/context/lang-context";
import { IUser } from "@/models/User";
import {
  Award,
  Calendar as CalendarIcon,
  Mail,
  Phone,
  Star,
  TrendingUp,
} from "lucide-react";

interface Props {
  user: IUser;
}

export default function ProfileHeader({ user }: Props) {
  const { t } = useLang();

  return (
    <div className="mb-8 relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Background Banner */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-linear-to-r from-primary/80 to-primary/40 dark:from-primary/40 dark:to-primary/10"></div>

      <div className="relative pt-16 px-6 pb-8 md:px-10 flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col md:flex-row md:items-end gap-6 w-full">
          <div className="relative rounded-full border-4 border-white dark:border-slate-900 shadow-md bg-white">
            <img
              className="h-32 w-32 object-cover rounded-full"
              src={user.avatar || "/default-avatar.png"}
              alt="avatar"
            />
          </div>

          <div className="flex-1 pb-2">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {user.firstName} {user.lastName}
              </h1>
              {/* {user.isVerified && <ShieldCheck className="w-6 h-6 text-blue-500" />} */}
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mt-2">
              {user.email && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
              )}
              {user.phoneNumber && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {t("member_since")}{" "}
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-GB")
                    : "-"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Loyalty Stats */}
        <div className="grid grid-cols-3 gap-3 w-full md:w-auto shrink-0 pb-2 mt-4 md:mt-0">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105">
            <Award className="w-6 h-6 text-primary mb-2 opacity-80" />
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {user?.loyalty_program.totalBooking || 0}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
              {t("total_bookings")}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105">
            <Star className="w-6 h-6 text-amber-500 mb-2 opacity-80" />
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {user?.loyalty_program.totalPoint || 0}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
              {t("loyalty_points")}
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl flex flex-col items-center justify-center text-center border border-slate-100 dark:border-slate-800 transition-transform hover:scale-105">
            <TrendingUp className="w-6 h-6 text-emerald-500 mb-2 opacity-80" />
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {user?.loyalty_program.levels.name || "_"}
            </p>
            <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-wider">
              {t("loyalty_level")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
