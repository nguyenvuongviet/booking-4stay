import { BookingCard } from "@/app/(pages)/booking/_component/BookingCard";
import { useLang } from "@/context/lang-context";
import { Booking } from "@/models/Booking";
import { IUser } from "@/models/User";
import { CalendarX, Loader2 } from "lucide-react";

interface Props {
  user: IUser | null;
  bookings: Booking[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
}

export default function BookingTab({
  user,
  bookings,
  loading,
  loadingMore,
  hasMore,
}: Props) {
  const { t } = useLang();
  return (
    <div className="mt-2 px-16 py-8 rounded-xl space-y-4 bg-card ">
      <h2 className="elegant-heading text-4xl my-6">
        {t("history_booking")}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">{t("loading_bookings")}</span>
          </div>
        </div>
      ) : user?.loyalty_program.totalBooking === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground ">
          <CalendarX className="h-12 w-12 mb-4 text-gray-400" />
          <p className="text-lg font-medium">{t("no_booking")}</p>
          <p className="text-sm text-gray-500 mt-1">
            {t("no_booking_desc")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 mt-2 p-8 rounded-xl space-y-4">
          {bookings.map((booking, index) => (
            <BookingCard
              key={`${booking.id}-${index}`}
              booking={booking}
            />
          ))}
          {loadingMore && (
            <div className="flex items-center justify-center py-6">
              <div className="flex items-center gap-3 text-muted">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-sm">{t("loading_more")}</span>
              </div>
            </div>
          )}

          {!hasMore && !loadingMore && bookings.length > 0 && (
            <div className="flex items-center justify-center py-2">
              <div className="text-center text-muted">
                <p className="text-sm ">{t("end_result")}</p>
                <p className="text-xs text-muted-foreground">
                  {t("total_found")} {bookings.length} rooms{" "}
                  {t("found")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

}
