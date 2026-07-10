"use client";
import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { motion, Variants } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useCheckout } from "../../../_hooks/useCheckout";
import BookingSummary from "./_component/BookingSummary";
import CouponSelector from "./_component/CouponSelector";
import GuestInfor from "./_component/GuestInfor";
import PaymentMethod from "./_component/PaymentMethod";
import PaymentModal from "./_component/PaymentModal";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function CheckoutClient() {
  const { t } = useLang();

  const {
    room,
    firstName,
    lastName,
    emailInput,
    phone,
    firstNameError,
    lastNameError,
    phoneError,
    emailError,
    setFirstName,
    setLastName,
    setEmailInput,
    setPhone,
    paymentMethod,
    setPaymentMethod,
    specialRequests,
    setSpecialRequests,
    expectedCheckInReq,
    setExpectedCheckInReq,
    expectedCheckInTime,
    setExpectedCheckInTime,
    expectedCheckInReason,
    setExpectedCheckInReason,
    bookingData,
    totalNights,
    isLoading,
    modalType,
    openPopupPayment,
    setOpenPopupPayment,
    confirmNow,
    confirmLater,
    handleConfirmBooking,
    setPolicyUpdatedAt,
    validateGuestInfo,
    // Coupon
    appliedCouponCode,
    couponFromUrl,
    handleApplyCoupon,
    handleClearCoupon,
  } = useCheckout();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId");
  const loc = searchParams.get("location") || "";
  const ad = searchParams.get("adults") || "1";
  const ch = searchParams.get("children") || "0";
  const ci = searchParams.get("checkIn") || "";
  const co = searchParams.get("checkOut") || "";

  const [fromTime, setFromTime] = useState("08:00");
  const [toTime, setToTime] = useState("10:00");

  const handleFromTimeChange = (val: string) => {
    setFromTime(val);
    if (val && toTime && val > toTime) {
      const [h, m] = val.split(":").map(Number);
      const nextH = (h + 1) % 24;
      const nextHStr = nextH < 10 ? `0${nextH}` : `${nextH}`;
      const mStr = m < 10 ? `0${m}` : `${m}`;
      setToTime(`${nextHStr}:${mStr}`);
    }
  };

  const handleToTimeChange = (val: string) => {
    setToTime(val);
    if (val && fromTime && val < fromTime) {
      const [h, m] = val.split(":").map(Number);
      const prevH = (h - 1 + 24) % 24;
      const prevHStr = prevH < 10 ? `0${prevH}` : `${prevH}`;
      const mStr = m < 10 ? `0${m}` : `${m}`;
      setFromTime(`${prevHStr}:${mStr}`);
    }
  };

  useEffect(() => {
    setExpectedCheckInTime(`${fromTime} - ${toTime}`);
  }, [fromTime, toTime, setExpectedCheckInTime]);

  return (
    <div className="min-h-screen bg-background">
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-2000">
          <div className="flex flex-col items-center gap-3 text-white">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="elegant-subheading text-sm">
              Đang xử lý thanh toán...
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <main className="container max-w-7xl mx-auto px-4 py-8 space-y-6 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-4">
            {/* Back Button */}
            <button
              onClick={() =>
                router.push(
                  `/room/${roomId}?location=${loc}&adults=${ad}&children=${ch}&checkIn=${ci}&checkOut=${co}`,
                )
              }
              className="group flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10 hover:scale-105 backdrop-blur-xl shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-x-1 cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6 text-muted-foreground group-hover:text-primary duration-300 transition-colors" />
            </button>

            {/* Title */}
            <div className="flex flex-col">
              <h1 className="text-2xl sm:text-3xl elegant-heading text-foreground leading-tight">
                {t("Confirm and Payment")}
              </h1>
            </div>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left  */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information  */}
            <motion.div variants={itemVariants}>
              <GuestInfor
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                emailInput={emailInput}
                setEmailInput={setEmailInput}
                phone={phone}
                setPhone={setPhone}
                firstNameError={firstNameError}
                lastNameError={lastNameError}
                phoneError={phoneError}
                emailError={emailError}
              />
            </motion.div>

            {/* Request & Early Checkin */}
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6 space-y-4">
                <div>
                  <h2 className="text-xl sm:text-2xl mb-2 sm:mb-4 elegant-heading">
                    {t("Special requests")}
                  </h2>
                  <textarea
                    className="w-full p-4 border border-border/80 focus:border-primary/50 rounded-2xl text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-input text-foreground"
                    placeholder={t("Please write your request")}
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  ></textarea>
                </div>

                <hr className="border-border/60" />

                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded-lg border-border/80 accent-primary cursor-pointer"
                      checked={expectedCheckInReq}
                      onChange={(e) => setExpectedCheckInReq(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-foreground">
                      Thông báo giờ nhận phòng dự kiến
                    </span>
                  </label>

                  {expectedCheckInReq && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 pt-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Khung giờ nhận phòng dự kiến
                          </label>
                          <div className="flex items-center gap-2 mt-1">
                            <input
                              type="time"
                              className="flex-1 p-3 border border-border/80 focus:border-primary/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-input text-foreground font-bold"
                              value={fromTime}
                              onChange={(e) =>
                                handleFromTimeChange(e.target.value)
                              }
                            />
                            <span className="text-gray-400 text-xs font-semibold">
                              đến
                            </span>
                            <input
                              type="time"
                              className="flex-1 p-3 border border-border/80 focus:border-primary/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-input text-foreground font-bold"
                              value={toTime}
                              onChange={(e) =>
                                handleToTimeChange(e.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-muted-foreground mb-1">
                            Ghi chú / Lý do (nếu nhận phòng sớm)
                          </label>
                          <input
                            type="text"
                            placeholder="Ví dụ: Muốn gửi đồ trước..."
                            className="w-full p-3 border border-border/80 focus:border-primary/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-input text-foreground placeholder:text-xs"
                            value={expectedCheckInReason}
                            onChange={(e) =>
                              setExpectedCheckInReason(e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <p className="text-xs text-amber-500 font-medium">
                        ⚠️ Lưu ý: Nếu giờ nhận phòng dự kiến của bạn sớm hơn giờ
                        nhận phòng tiêu chuẩn (14:00), yêu cầu cần được Admin
                        phê duyệt và có thể phát sinh thêm phụ phí tùy theo tình
                        trạng phòng trống.
                      </p>
                    </motion.div>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Coupon */}
            <motion.div variants={itemVariants}>
              <CouponSelector
                rawTotal={bookingData.rawTotal}
                provinceId={room?.location?.provinceId}
                onApply={handleApplyCoupon}
                onClear={handleClearCoupon}
                appliedCode={appliedCouponCode ?? undefined}
                initialCode={couponFromUrl ?? undefined}
              />
            </motion.div>

            {/* Payment */}
            <motion.div variants={itemVariants}>
              <PaymentMethod
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
              />
            </motion.div>
          </div>

          {/* Right  */}
          <motion.div
            className="lg:col-span-1 lg:sticky lg:top-20"
            variants={itemVariants}
          >
            <BookingSummary
              bookingData={bookingData}
              totalNights={totalNights}
              paymentMethod={paymentMethod}
              handleConfirmBooking={() => {
                if (!validateGuestInfo()) return;
                handleConfirmBooking(paymentMethod);
              }}
              onPolicyLoad={setPolicyUpdatedAt}
            />
          </motion.div>
        </motion.div>
      </main>

      <PaymentModal
        open={openPopupPayment}
        onClose={() => setOpenPopupPayment(false)}
        type={modalType!}
        onDepositNow={confirmNow}
        onDepositLater={confirmLater}
      />
    </div>
  );
}
