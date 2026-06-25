import { CancellationPolicy } from "@/_components/CancellationPolicy";
import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { getTierColorClass } from "@/_helper/tier.helper";
import { useLang } from "@/context/lang-context";
import { PaymentMethod } from "@/types/paymentmethod";

interface BookingData {
  roomName: string;
  roomType: string | null;
  checkIn: string;
  checkOut: string;
  adults: string | null;
  children: string | null;
  pricePerNight: number;
  rawTotal: number;
  totalAmount: number;
  discountPercent: number;
  roomImage: string | null;
  // Waterfall fields
  couponDiscount?: number;
  couponCode?: string | null;
  loyaltyDiscount?: number;
  tierName?: string;
}

interface Props {
  bookingData: BookingData;
  totalNights: number;
  paymentMethod: PaymentMethod;
  handleConfirmBooking: (v: PaymentMethod) => void;
  onPolicyLoad?: (updatedAt: string) => void;
}

export default function BookingSummary(props: Props) {
  const {
    bookingData,
    totalNights,
    paymentMethod,
    handleConfirmBooking,
    onPolicyLoad,
  } = props;
  const { t } = useLang();

  const couponDiscount = bookingData.couponDiscount || 0;
  const loyaltyDiscount = bookingData.loyaltyDiscount || 0;
  const hasWaterfallDiscount = couponDiscount > 0 || loyaltyDiscount > 0;

  return (
    <Card className="p-4 sm:p-6 sticky top-24 max-h-screen overflow-y-auto space-y-4">
      <h2 className="text-xl sm:text-2xl elegant-heading mb-4 sm:mb-6">
        {t("Booking Summary")}
      </h2>
      <div className="w-full h-40 sm:h-50 rounded-2xl overflow-hidden mb-2">
        <img
          src={bookingData.roomImage || "/placeholder.svg"}
          alt="Room img"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Room Details */}
      <div>
        <h3 className="elegant-sans text-lg sm:text-xl mb-1">
          {bookingData.roomName}
        </h3>
        <p className="text-sm text-gray-600 mb-3">{bookingData.roomType}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("checkIn")}:</span>
            <span className="elegant-sans text-foreground">
              {bookingData.checkIn}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("checkOut")}:</span>
            <span className="elegant-sans text-foreground">
              {bookingData.checkOut}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("Nights")}:</span>
            <span className="elegant-sans text-foreground">{totalNights}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("adults")}: </span>
            <span className="elegant-sans text-foreground">
              {bookingData.adults}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("children")}:</span>
            <span className="elegant-sans text-foreground">
              {bookingData.children}
            </span>
          </div>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {bookingData.pricePerNight.toLocaleString()}đ x {totalNights}{" "}
            {t("nights")}
          </span>
          <span className="text-foreground">
            {bookingData.rawTotal.toLocaleString()}đ
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{t("Taxes & fees")}</span>
          <span className="text-foreground">{t("Included")}</span>
        </div>

        {/* Waterfall Discount Breakdown */}
        {couponDiscount > 0 && (
          <div className="flex justify-between items-start text-sm gap-2">
            <span className="text-muted-foreground flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="whitespace-nowrap">🎫 Mã giảm giá</span>
              {bookingData.couponCode && (
                <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded font-mono font-semibold">
                  {bookingData.couponCode}
                </span>
              )}
            </span>
            <span className="text-green-600 font-medium whitespace-nowrap shrink-0 text-right">
              -{couponDiscount.toLocaleString()}đ
            </span>
          </div>
        )}

        {loyaltyDiscount > 0 && (
          <div className="flex justify-between items-start text-sm gap-2">
            <span className="text-muted-foreground flex flex-wrap items-center gap-1.5 min-w-0">
              <span className="whitespace-nowrap">⭐ Ưu đãi thành viên</span>
              {bookingData.tierName && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${getTierColorClass(bookingData.tierName, "badge")}`}
                >
                  {bookingData.tierName}
                </span>
              )}
            </span>
            <span className="text-green-600 font-medium whitespace-nowrap shrink-0 text-right">
              -{loyaltyDiscount.toLocaleString()}đ
              <span className="text-xs text-green-600">
                {" "}
                ({bookingData.discountPercent}%)
              </span>
            </span>
          </div>
        )}

        {/* Fallback: show old format if no waterfall fields */}
        {!hasWaterfallDiscount && bookingData.discountPercent > 0 && (
          <div className="flex justify-between items-start text-sm gap-2">
            <span className="text-muted-foreground whitespace-nowrap">
              Giảm giá
            </span>
            <span className="text-foreground whitespace-nowrap shrink-0 text-right">
              -
              {Math.floor(
                (bookingData.pricePerNight *
                  totalNights *
                  bookingData.discountPercent) /
                  100,
              ).toLocaleString()}
              đ
              <span className="text-xs text-green-600">
                {" "}
                ({bookingData.discountPercent}%)
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Cancellation Policy */}
      <div className="border-t pt-4 border-dashed">
        <CancellationPolicy
          checkInDate={
            bookingData.checkIn ? new Date(bookingData.checkIn) : undefined
          }
          onLoad={(config) => onPolicyLoad?.(config.updatedAt)}
          collapsible={true}
        />
      </div>

      {/* Total */}
      <div className="border-t pt-4 space-y-2.5">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-foreground">
            {t("total")}
          </span>
          <span className="text-2xl font-extrabold text-foreground tracking-tight">
            {bookingData.totalAmount.toLocaleString()}đ
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted-foreground">{t("Points earned")}</span>
          <span className="font-semibold text-green-600">
            +{(bookingData.totalAmount / 1000).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={() => handleConfirmBooking(paymentMethod)}
        variant="gradient"
        size="xl"
        className="w-full mt-5"
      >
        {t("Confirm and Payment")}
      </Button>
    </Card>
  );
}
