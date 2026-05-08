"use client";

import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import { ChevronLeft } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCheckout } from "../../../_hooks/useCheckout";
import BookingSummary from "./_component/BookingSummary";
import GuestInfor from "./_component/GuestInfor";
import PaymentMethod from "./_component/PaymentMethod";
import PaymentModal from "./_component/PaymentModal";

export default function CheckoutClient() {
  const { t } = useLang();

  const {
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
      {/* <Header /> */}

      <main className="container max-w-7xl mx-auto px-4 py-8 space-y-12 sm:px-6 lg:px-8">
        <div className="sticky top-0 z-30 backdrop-blur-xl bg-background/70 border-b border-border/50">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 h-20 flex items-center gap-4 ">
            {/* Back Button */}
            <button
              onClick={() =>
                router.push(
                  `/room/${roomId}?location=${loc}&adults=${ad}&children=${ch}&checkIn=${ci}&checkOut=${co}`,
                )
              }
              className="group flex items-center justify-center h-10 w-10 rounded-full hover:bg-primary/10 hover:scale-105 backdrop-blur-xl shadow-sm hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 transition-all duration-300 hover:-translate-x-1"
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

        <h1 className="text-3xl elegant-heading"></h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left  */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information  */}
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

            {/* Payment */}
            <PaymentMethod
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />

            {/* Request  */}
            <Card className="p-6">
              <h2 className="text-2xl mb-2 elegant-heading">
                {t("Special requests")}
              </h2>
              <textarea
                className="p-4 border border-border rounded-lg text-sm px-4 py-3 resize-none h-24"
                placeholder={t("Please write your request")}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
              ></textarea>
            </Card>
          </div>
          {/* Right  */}
          <div className="lg:col-span-1 sticky top-20">
            {/* Booking Summary  */}
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
          </div>
        </div>
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
