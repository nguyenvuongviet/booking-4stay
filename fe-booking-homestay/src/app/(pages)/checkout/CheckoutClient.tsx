"use client";

import Header from "./_component/Header";
import { Card } from "@/_components/ui/card";
import { useLang } from "@/context/lang-context";
import GuestInfor from "./_component/GuestInfor";
import PaymentMethod from "./_component/PaymentMethod";
import BookingSummary from "./_component/BookingSummary";
import PaymentModal from "./_component/PaymentModal";
import { useCheckout } from "../../../_hooks/useCheckout";

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
        setFirstName,
        setLastName,
        setEmailInput,
        setPhone,
        paymentMethod,
        setPaymentMethod,
        specialRequests,
        setSpecialRequests,
        bookingData,
        totalAmount,
        totalNights,
        discountPercent,
        isLoading,
        modalType,
        openPopupPayment,
        setOpenPopupPayment,
        confirmNow,
        confirmLater,
        handleConfirmBooking,
        setPolicyUpdatedAt,
    } = useCheckout();

    return (
        <div className="min-h-screen bg-background">
            {isLoading && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-2000">
                    <div className="flex flex-col items-center gap-3 text-white">
                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        <p className="elegant-subheading text-sm">Đang xử lý thanh toán...</p>
                    </div>
                </div>
            )}
            {/* Header */}
            <Header />

            <main className="container max-w-7xl mx-auto px-4 py-8 space-y-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl elegant-heading">{t("Confirm and Payment")}</h1>
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
                            totalAmount={totalAmount} 
                            paymentMethod={paymentMethod} 
                            handleConfirmBooking={handleConfirmBooking}
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