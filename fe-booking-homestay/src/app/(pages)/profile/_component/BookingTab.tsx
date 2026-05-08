import { BookingCard } from "@/app/(pages)/booking/_component/BookingCard";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { IUser } from "@/models/User";
import { CalendarX, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface Props {
  user: IUser | null;
  bookings: Booking[];
  loading: boolean;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
}

export default function BookingTab({
  user,
  bookings,
  loading,
  page,
  setPage,
  totalPages,
}: Props) {
  const { t } = useLang();

  return (
    <div className="bg-white dark:bg-dark p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl elegant-heading tracking-tight dark:text-white">
          {t("history_booking")}
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Xem lại các chuyến đi trước đây và sắp tới của bạn.
        </p>
      </div>

      {loading && page === 1 ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4 text-slate-500">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-sm font-medium">{t("loading_bookings")}</span>
          </div>
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
          <CalendarX className="h-16 w-16 mb-4 text-slate-300 dark:text-slate-600" />
          <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            {t("no_booking")}
          </p>
          <p className="text-sm max-w-md">{t("no_booking_desc")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 gap-6 relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 z-10 flex items-center justify-center backdrop-blur-sm rounded-xl">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {bookings.map((booking, index) => (
              <div
                key={`${booking.id}-${index}`}
                className="transition-all hover:-translate-y-1"
              >
                <BookingCard booking={booking} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1 || loading}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                <span className="bg-primary/10 text-primary w-8 h-8 flex items-center justify-center rounded-lg">
                  {page}
                </span>
                <span>/</span>
                <span>{totalPages}</span>
              </div>

              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages || loading}
                className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
