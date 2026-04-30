import { CancellationPolicy } from "@/_components/CancellationPolicy";
import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
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

  return (
    <Card className="p-6 sticky top-10 space-y-2">
      <h2 className="text-2xl elegant-heading">{t("Booking Summary")}</h2>
      <div className="w-full h-50 rounded-lg overflow-hidden">
        <img
          src={bookingData.roomImage || "/placeholder.svg"}
          alt="Room img"
          className="w-full h-full object-cover"
        />
      </div>
      {/* Room Details */}
      <div>
        <h3 className="elegant-sans text-xl mb-1">{bookingData.roomName}</h3>
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
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Giảm giá</span>
          <span className="text-foreground">
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
      </div>

      {/* Total */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-lg elegant-sans text-foreground">
            {t("total")}
          </span>
          <span className="text-lg elegant-sans text-foreground">
            {bookingData.totalAmount.toLocaleString()}đ
          </span>
        </div>
        <div className="flex justify-between items-baseline">
          <span className="text-sm text-foreground">{t("Points earned")}</span>
          <span className="text-sm text-green-600">
            +{(bookingData.totalAmount / 1000).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={() => handleConfirmBooking(paymentMethod)}
        className="rounded-2xl w-full bg-primary h-10 elegant-subheading text-md"
      >
        {t("Confirm and Payment")}
      </Button>

      {/* Cancellation Policy */}
      <div className="pt-4 border-t border-dashed">
        <CancellationPolicy
          checkInDate={new Date(bookingData.checkIn)}
          onLoad={(config) => onPolicyLoad?.(config.updatedAt)}
        />
      </div>
    </Card>
  );
}
