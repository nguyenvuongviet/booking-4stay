"use client";

import PaymentModal from "@/components/payment/PaymentModal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePayment } from "@/_hooks/usePayment";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { room_detail } from "@/services/roomApi";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { differenceInDays, format, parseISO } from "date-fns";
import { ArrowLeft, Check, CreditCard, DollarSign } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type PaymentMethod = "VNPAY" | "CASH";

export default function CheckoutPage() {
    const { user } = useAuth();
    const { t } = useLang();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [phone, setPhone] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [specialRequests, setSpecialRequests] = useState("");

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || "");
            setLastName(user.lastName || "");
            setEmailInput(user.email || "");
            setPhone(user.phoneNumber || "");
        }
    }, [user]);

    const searchParams = useSearchParams();
    const roomId = searchParams.get("roomId");
    const loc = searchParams.get("location");
    const ad = searchParams.get("adults");
    const ch = searchParams.get("children");
    const ci = searchParams.get("checkIn");
    const co = searchParams.get("checkOut");
    const [room, setRoom] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const parsedCheckIn = ci ? parseISO(ci) : null;
    const parsedCheckOut = co ? parseISO(co) : null;
    const [isLoading, setIsLoading] = useState(false);

    const bookingData = {
        hotelName: room?.name,
        roomType: room?.description,
        checkIn: parsedCheckIn ? format(parsedCheckIn, "yyyy-MM-dd") : "",
        checkOut: parsedCheckOut ? format(parsedCheckOut, "yyyy-MM-dd") : "",
        adults: ad,
        children: ch,
        pricePerNight: room?.price,
        hotelImage: room?.images?.main,
    };

    const totalNights = differenceInDays(
        new Date(bookingData.checkOut),
        new Date(bookingData.checkIn)
    );

    const totalAmount = bookingData.pricePerNight * totalNights;

    const {
        modalType,
        openPopupPayment,
        setOpenPopupPayment,
        handleConfirmBooking,
        handleDepositNow,
        handleDepositLater
    } = usePayment(room, bookingData);

    if (!roomId || !ci || !co) {
        toast.error("Thiếu dữ liệu đặt phòng!");
        return;
    }

    const confirmNow = async () => {
        setIsLoading(true);

        await handleDepositNow({
            roomId,
            checkIn: ci!,
            checkOut: co!,
            adults: Number(ad),
            children: Number(ch),
            guestFullName: `${firstName} ${lastName}`,
            guestEmail: emailInput,
            guestPhoneNumber: phone,
            specialRequest: specialRequests,
            paymentMethod
        }).finally(() => setIsLoading(false));
    }

    const confirmLater = async () =>  {
        setIsLoading(true);

        await handleDepositLater({
            roomId,
            checkIn: ci!,
            checkOut: co!,
            adults: Number(ad),
            children: Number(ch),
            guestFullName: `${firstName} ${lastName}`,
            guestEmail: emailInput,
            guestPhoneNumber: phone,
            specialRequest: specialRequests,
            paymentMethod
        }).finally(() => setIsLoading(false));
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const roomData = await room_detail(roomId!);
                setRoom(roomData);
            } catch (error) {
                console.error("Error fetching checkout data:", error);
            } finally {
                setLoading(false);
            }
        };

        if (roomId) fetchData();
    }, [roomId]);

    console.log("checkIn param =", ci);
    console.log("checkOut param =", co);

    return (
        <div className="min-h-screen bg-background">
            {isLoading && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[2000]">
                    <div className="flex flex-col items-center gap-3 text-white">
                        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        <p className="elegant-subheading text-sm">Đang xử lý thanh toán...</p>
                    </div>
                </div>
            )}
            {/* Header */}
            <header className="bg-background border-b sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <button
                        onClick={() =>
                            router.push(
                                `/room/${roomId}?location=${loc}&adults=${ad}&children=${ch}&checkIn=${ci}&checkOut=${co}`
                            )
                        }
                        className="px-4 flex items-center gap-2 text-gray-900 hover:text-primary hover:cursor-pointer"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="elegant-sans text-lg">{t("Back")}</span>
                    </button>
                </div>
            </header>

            <main className="container max-w-7xl mx-auto px-4 py-8 space-y-12 sm:px-6 lg:px-8">
                <h1 className="text-3xl elegant-heading">{t("Confirm and Payment")}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left  */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Guest Information  */}
                        <Card className="p-6">
                            <h2 className="text-2xl elegant-heading mb-4">
                                {t("Guest information")}
                            </h2>
                            <div className="grid grid-cols-2  gap-4">
                                {/* First Name */}
                                <div>
                                    <Label
                                        htmlFor="firstName"
                                        className="text-foreground elegant-subheading"
                                    >
                                        {t("firstName")}
                                    </Label>
                                    <Input
                                        id="firstName"
                                        className="bg-input rounded-2xl mt-1 mb-2"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                    />
                                    {firstNameError && (
                                        <p className="text-destructive text-xs mb-1">
                                            {firstNameError}
                                        </p>
                                    )}
                                </div>
                                {/* Last Name */}
                                <div>
                                    <Label
                                        htmlFor="lastName"
                                        className="text-foreground elegant-subheading"
                                    >
                                        {t("lastName")}
                                    </Label>
                                    <Input
                                        id="lastName"
                                        className="bg-input rounded-2xl mt-1 mb-2"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                    />
                                    {lastNameError && (
                                        <p className="text-destructive text-xs mb-1">
                                            {lastNameError}
                                        </p>
                                    )}
                                </div>
                                {/* Email */}
                                <div>
                                    <Label
                                        htmlFor="email"
                                        className="text-foreground elegant-subheading"
                                    >
                                        Your email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 bg-input rounded-2xl"
                                        value={emailInput}
                                        onChange={(e) => setEmailInput(e.target.value)}
                                    />
                                </div>
                                {/* Phone Number  */}
                                <div>
                                    <Label
                                        htmlFor="phone"
                                        className="text-foreground elegant-subheading"
                                    >
                                        {t("phone")}
                                    </Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        className="bg-input rounded-2xl mt-1 mb-2"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                </div>
                                {phoneError && (
                                    <p className="text-destructive text-xs mb-2">{phoneError}</p>
                                )}
                            </div>
                        </Card>
                        {/* Payment */}
                        <Card className="p-6">
                            <h2 className="text-2xl mb-4 elegant-heading">{t("Payment menthod")}</h2>
                            <RadioGroup
                                value={paymentMethod}
                                onValueChange={(value) =>
                                    setPaymentMethod(value as PaymentMethod)
                                }
                            >
                                <div className="space-y-3">
                                    {/* Cash Payment */}
                                    <label
                                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === "CASH"
                                            ? "border-primary bg-primary-100"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <RadioGroupItem value="CASH" id="CASH" />
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {t("Cash Payment")}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {t(
                                                        "Pay 30% deposit via transfer, the remaining in cash when checking in"
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === "CASH" && (
                                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </label>
                                    {/* Vnpay */}
                                    <label
                                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === "VNPAY"
                                            ? "border-primary bg-primary-100"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <RadioGroupItem value="VNPAY" id="VNPAY" />
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {t("VNPay (Bank transfer/ Card/ QR code)")}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {t(
                                                        "Secure and fast online payment via VNPay. Supports major banks and e-wallets."
                                                    )}
                                                    {/* Thanh toán trực tuyến an toàn và nhanh chóng qua VNPay. Hỗ trợ các ngân hàng lớn và ví điện tử. */}
                                                </p>
                                            </div>
                                        </div>
                                        {paymentMethod === "VNPAY" && (
                                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                                <Check className="h-4 w-4 text-white" />
                                            </div>
                                        )}
                                    </label>

                                    {/* Momo */}
                                    {/* <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "momo"
                        ? "border-primary bg-primary-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="momo" id="momo" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Momo</p>
                        <p className="text-sm text-gray-600">
                          Pay securely with your Momo account
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "momo" && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </label> */}
                                </div>
                            </RadioGroup>

                            {/* Vnpay Info */}
                            {paymentMethod === "VNPAY" && (
                                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
                                    <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                                        <CreditCard className="w-5 h-5 text-blue-700" />
                                        {/* VNPAY – Thanh toán nhanh & an toàn */}
                                        {t("vnpay_title")}
                                    </h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {t("vnpay_intro_1")} <strong>{t("qr")}</strong> {t("or")}{" "}
                                        <strong>{t("cards")}</strong>. {t("vnpay_intro_2")}
                                        {/* VNPAY hỗ trợ thanh toán trực tuyến qua{" "}
                    <strong>mã QR</strong> hoặc{" "}
                    <strong>
                      thẻ ngân hàng nội địa/quốc tế (Visa, MasterCard)
                    </strong>
                    . Bạn có thể lựa chọn một trong hai cách sau: */}
                                    </p>

                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>
                                            <strong>{t("scan_qr")}:</strong> {t("scan_qr_desc")}
                                            {/* <strong>Quét mã QR:</strong> Sử dụng ứng dụng ngân hàng
                      (Mobile Banking) hoặc ví VNPAY để quét mã và xác nhận
                      thanh toán nhanh chóng. */}
                                        </li>
                                        <li>
                                            <strong>{t("card_payment")}:</strong>{" "}
                                            {t("card_payment_desc")}
                                            {/* <strong>Thanh toán bằng thẻ:</strong> Nhập thông tin thẻ
                      ngân hàng hoặc thẻ tín dụng để hoàn tất giao dịch trực
                      tuyến. */}
                                        </li>
                                    </ul>

                                    <p className="text-sm text-gray-700">
                                        {t("after_confirm")}{" "}
                                        <strong>{t("Confirm and Payment")}</strong>,
                                        {t("vnpay_redirect")}
                                        {/* Sau khi nhấn <strong>"Confirm booking"</strong>, bạn sẽ được
                    chuyển đến cổng thanh toán VNPAY để hoàn tất giao dịch an
                    toàn. Sau khi thanh toán thành công, hệ thống sẽ tự động xác
                    nhận đơn đặt phòng của bạn. */}
                                    </p>

                                    <p className="text-xs text-gray-500 italic">
                                        * {t("secure_notice")}
                                        {/* * Mọi giao dịch đều được mã hóa và bảo mật theo tiêu chuẩn
                    VNPAY. */}
                                    </p>
                                </div>
                            )}

                            {/* Money Info */}
                            {paymentMethod === "CASH" && (
                                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100 space-y-2">
                                    <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                                        <DollarSign className="w-5 h-5 text-green-700" />
                                        {t("cash_title")}
                                    </h3>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {t("cash_intro_1")}
                                        {t("cash_intro_2")}
                                    </p>

                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        <li>
                                            {t("cash_rule_1")}
                                        </li>
                                        <li>
                                            {t("cash_rule_2_1")}{" "}
                                            <strong>{t("temporary_reserved")}</strong>{" "}
                                            {t("cash_rule_2_2")}
                                        </li>
                                        <li>
                                            {t("cash_rule_3")}
                                        </li>
                                    </ul>

                                    <p className="text-sm text-gray-700">
                                        {/* {t("cash_after_confirm")} */}
                                    </p>

                                    <p className="text-xs text-gray-500 italic">
                                        * {t("cash_note")}
                                    </p>
                                </div>
                            )}
                        </Card>
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
                        <Card className="p-6 sticky top-10 space-y-2">
                            <h2 className="text-2xl elegant-heading">{t("Booking Summary")}</h2>
                            <div className="w-full h-50 rounded-lg overflow-hidden">
                                <img
                                    src={bookingData.hotelImage || "/placeholder.svg"}
                                    alt="Hotel img"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            {/* Hotel Details */}
                            <div>
                                <h3 className="elegant-sans text-xl mb-1">
                                    {bookingData.hotelName}
                                </h3>
                                <p className="text-sm text-gray-600 mb-3">
                                    {bookingData.roomType}
                                </p>

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
                                        <span className="elegant-sans text-foreground">
                                            {totalNights}
                                        </span>
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
                                        đ {bookingData?.pricePerNight?.toLocaleString()} x{" "}
                                        {totalNights} {t("nights")}
                                    </span>
                                    <span className="text-foreground">
                                        đ{" "}
                                        {(
                                            bookingData.pricePerNight * totalNights
                                        ).toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{t("Taxes & fees")}</span>
                                    <span className="text-foreground">{t("Included")}</span>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-lg elegant-sans text-foreground">
                                        {t("total")}
                                    </span>
                                    <span className="text-lg elegant-sans text-foreground">
                                        đ{totalAmount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-sm text-foreground">{t("Points earned")}</span>
                                    <span className="text-sm text-green-600">
                                        +{(totalAmount / 1000).toLocaleString()}
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
                            <div className="text-xs text-gray-600 space-y-1">
                                <p className="font-medium text-gray-900">
                                    {t("Cancellation & Refund Policy")}
                                </p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>{t("Cancel 7 or more days before check-in → Full refund (100%)")}.</li>
                                    <li>{t("Cancel 3–6 days before check-in → 50% refund")}.</li>
                                    <li>{t("Cancel within 2 days of check-in → No refund")}.</li>
                                </ul>
                            </div>
                        </Card>
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
