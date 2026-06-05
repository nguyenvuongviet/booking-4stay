"use client";

import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { motion, Variants } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
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

            {/* Request  */}
            <motion.div variants={itemVariants}>
              <Card className="p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl mb-4 sm:mb-6 elegant-heading">
                  {t("Special requests")}
                </h2>
                <textarea
                  className="w-full p-4 border border-border/80 focus:border-primary/50 rounded-2xl text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all bg-input text-foreground"
                  placeholder={t("Please write your request")}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                ></textarea>
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
