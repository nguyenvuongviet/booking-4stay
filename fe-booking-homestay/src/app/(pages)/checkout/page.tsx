"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { create_booking, pay_with_vnpay } from "@/services/bookingApi";
import { room_detail } from "@/services/roomApi";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Check, CreditCard, DollarSign } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type PaymentMethod = "vnpay" | "cash";

export default function CheckoutPage() {
  const { user } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

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

  const handleConfirmBooking = async () => {
    try {
      const resp = await create_booking({
        roomId: roomId!,
        checkIn: ci!,
        checkOut: co!,
        adults: Number(ad),
        children: Number(ch),
      });

      //thanh toán qua VNPAY
      if (paymentMethod === "vnpay") {
        try {
          const payment = await pay_with_vnpay(
            room.price * bookingData.nights,
            resp.data?.booking?.id
          );
          window.location.href = payment.url; // redirect sang VNPAY
        } catch (error) {
          console.error("Error creating booking:", error);
          return;
        }
      }

      //trả tiền mặt
      if (paymentMethod === "cash") {
        router.push("/booking");
      }

      toast.success("Booking confirmed! Thank you for your reservation.");
      console.log("Booking created successfully:", resp);
      setTimeout(() => {
        router.push("/booking");
      }, 5000);
    } catch (error) {
      console.error("Error creating booking:", error);
    }

    console.log("Confirming booking with payment method:", paymentMethod);
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

  const parsedCheckIn = ci ? parseISO(ci) : null;
  const parsedCheckOut = co ? parseISO(co) : null;

  const bookingData = {
    hotelName: room?.name,
    roomType: room?.description,
    checkIn: parsedCheckIn ? format(parsedCheckIn, "yyyy-MM-dd") : "",
    checkOut: parsedCheckOut ? format(parsedCheckOut, "yyyy-MM-dd") : "",
    nights:
      (parsedCheckOut!.getTime() - parsedCheckIn!.getTime()) /
      (1000 * 60 * 60 * 24),
    adults: ad,
    children: ch,
    pricePerNight: room?.price,
    hotelImage: room?.images?.main,
  };

  return (
    <div className="min-h-screen bg-background">
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
            <span className="elegant-sanserif text-lg">Back</span>
          </button>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 py-8 space-y-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl elegant-heading">Confirm and Payment</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left  */}
          <div className="lg:col-span-2 space-y-6">
            {/* Guest Information  */}
            <Card className="p-6">
              <h2 className="text-2xl elegant-heading mb-4">
                Guest Information
              </h2>
              <div className="grid grid-cols-2  gap-4">
                {/* First Name */}
                <div>
                  <Label
                    htmlFor="firstName"
                    className="text-foreground elegant-subheading"
                  >
                    First name
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
                    Last name
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
                    Your mobile phone number
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
              <h2 className="text-2xl mb-4 elegant-heading">Payment menthod</h2>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
              >
                <div className="space-y-3">
                  {/* Cash Payment */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "cash"
                        ? "border-primary bg-primary-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="cash" id="cash" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Cash Payment
                        </p>
                        <p className="text-sm text-gray-600">
                          Pay directly in cash when you arrive. No online
                          payment required.
                          {/* Thanh toán trực tiếp bằng tiền mặt khi đến nơi. Không cần thanh toán trực tuyến. */}
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "cash" && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </label>
                  {/* Vnpay */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "vnpay"
                        ? "border-primary bg-primary-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="vnpay" id="vnpay" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          VNPay (Bank transfer / QR code)
                        </p>
                        <p className="text-sm text-gray-600">
                          Secure and fast online payment via VNPay. Supports
                          major banks and e-wallets.
                          {/* Thanh toán trực tuyến an toàn và nhanh chóng qua VNPay. Hỗ trợ các ngân hàng lớn và ví điện tử. */}
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "vnpay" && (
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
              {paymentMethod === "vnpay" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 space-y-2">
                  <h3 className="text-lg font-semibold text-blue-700 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-700" />
                    {/* VNPAY – Thanh toán nhanh & an toàn */}
                    VNPAY – Fast & Secure Payment
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    VNPAY supports online payments via <strong>QR code</strong>{" "}
                    or{" "}
                    <strong>
                      domestic/international bank cards (Visa, MasterCard)
                    </strong>
                    . You can choose one of the following methods:
                    {/* VNPAY hỗ trợ thanh toán trực tuyến qua{" "}
                    <strong>mã QR</strong> hoặc{" "}
                    <strong>
                      thẻ ngân hàng nội địa/quốc tế (Visa, MasterCard)
                    </strong>
                    . Bạn có thể lựa chọn một trong hai cách sau: */}
                  </p>

                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>
                      <strong>Scan QR Code:</strong> Use your banking app or
                      VNPAY Wallet to scan and confirm your payment instantly.
                      {/* <strong>Quét mã QR:</strong> Sử dụng ứng dụng ngân hàng
                      (Mobile Banking) hoặc ví VNPAY để quét mã và xác nhận
                      thanh toán nhanh chóng. */}
                    </li>
                    <li>
                      <strong>Card Payment:</strong> Enter your bank or
                      credit/debit/master card details to complete the online
                      transaction.
                      {/* <strong>Thanh toán bằng thẻ:</strong> Nhập thông tin thẻ
                      ngân hàng hoặc thẻ tín dụng để hoàn tất giao dịch trực
                      tuyến. */}
                    </li>
                  </ul>

                  <p className="text-sm text-gray-700">
                    After clicking <strong>"Confirm booking"</strong>, you’ll be
                    redirected to the VNPAY payment gateway to securely complete
                    your transaction. Once the payment is successful, your
                    booking will be automatically confirmed.
                    {/* Sau khi nhấn <strong>"Confirm booking"</strong>, bạn sẽ được
                    chuyển đến cổng thanh toán VNPAY để hoàn tất giao dịch an
                    toàn. Sau khi thanh toán thành công, hệ thống sẽ tự động xác
                    nhận đơn đặt phòng của bạn. */}
                  </p>

                  <p className="text-xs text-gray-500 italic">
                    * All transactions are encrypted and secured by VNPAY
                    standards.
                    {/* * Mọi giao dịch đều được mã hóa và bảo mật theo tiêu chuẩn
                    VNPAY. */}
                  </p>
                </div>
              )}

              {/* Money Info */}
              {paymentMethod === "cash" && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100 space-y-2">
                  <h3 className="text-lg font-semibold text-green-700 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-700" />
                    Cash Payment
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    You can choose to pay in <strong>cash</strong> when you
                    arrive at the accommodation. This is a convenient option if
                    you prefer not to pay online.
                    {/* Bạn có thể chọn thanh toán bằng <strong>tiền mặt</strong> khi đến nơi
                    lưu trú. Đây là lựa chọn tiện lợi nếu bạn không muốn thanh toán trực
                    tuyến. */}
                  </p>

                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    <li>
                      Please make sure to prepare the exact amount for your stay
                      to speed up the check-in process.
                      {/* Vui lòng chuẩn bị số tiền chính xác để quá trình nhận phòng diễn ra nhanh chóng. */}
                    </li>
                    <li>
                      The booking will be <strong>reserved temporarily</strong>{" "}
                      until you complete the payment at the property.
                      {/* Đơn đặt phòng sẽ được <strong>giữ tạm thời</strong> cho đến khi bạn
                      hoàn tất thanh toán tại nơi lưu trú. */}
                    </li>
                    <li>
                      If you fail to check in or pay on time, your booking may
                      be canceled automatically.
                      {/* Nếu bạn không đến hoặc không thanh toán đúng hạn, đơn đặt phòng có thể bị hủy tự động. */}
                    </li>
                  </ul>

                  <p className="text-sm text-gray-700">
                    Once you confirm this booking, you will receive a
                    confirmation email with all details and instructions for
                    paying by cash.
                    {/* Sau khi xác nhận đặt phòng, bạn sẽ nhận được email xác nhận kèm thông
                    tin chi tiết và hướng dẫn thanh toán bằng tiền mặt. */}
                  </p>

                  <p className="text-xs text-gray-500 italic">
                    * No deposit or online payment required. Payment is made
                    directly at the property.
                    {/* * Không yêu cầu đặt cọc hoặc thanh toán trực tuyến. Thanh toán trực tiếp tại nơi lưu trú. */}
                  </p>
                </div>
              )}
            </Card>
            {/* Request  */}
            <Card className="p-6">
              <h2 className="text-2xl mb-2 elegant-heading">
                Special requests
              </h2>
              <textarea
                className="p-4 border border-border rounded-lg text-sm px-4 py-3 resize-none h-24"
                placeholder="Please write your request..."
              ></textarea>
            </Card>
          </div>
          {/* Right  */}
          <div className="lg:col-span-1 sticky top-20">
            {/* Booking Summary  */}
            <Card className="p-6 sticky top-10 space-y-2">
              <h2 className="text-2xl elegant-heading">Booking Summary</h2>
              <div className="w-full h-50 rounded-lg overflow-hidden">
                <img
                  src={bookingData.hotelImage || "/placeholder.svg"}
                  alt="Hotel img"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Hotel Details */}
              <div>
                <h3 className="elegant-sanserif text-xl text-gray-900 mb-1">
                  {bookingData.hotelName}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {bookingData.roomType}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-medium text-gray-900">
                      {bookingData.checkIn}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-medium text-gray-900">
                      {bookingData.checkOut}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nights:</span>
                    <span className="font-medium text-gray-900">
                      {bookingData.nights}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Adults: </span>
                    <span className="font-medium text-gray-900">
                      {bookingData.adults}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Children:</span>
                    <span className="font-medium text-gray-900">
                      {bookingData.children}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    đ {bookingData?.pricePerNight?.toLocaleString()} x{" "}
                    {bookingData.nights} nights
                  </span>
                  <span className="text-gray-900">
                    đ{" "}
                    {(
                      bookingData.pricePerNight * bookingData.nights
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taxes & fees</span>
                  <span className="text-gray-900">Included</span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-semibold text-gray-900">
                    Total
                  </span>
                  <span className="text-2xl font-bold text-gray-900">
                    đ{" "}
                    {(
                      bookingData.pricePerNight * bookingData.nights
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <Button
                onClick={() => handleConfirmBooking()}
                className="rounded-2xl w-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 elegant-subheading text-md"
              >
                Confirm booking
              </Button>

              {/* Cancellation Policy */}
              <div className="text-xs text-gray-600 space-y-1">
                <p className="font-medium text-gray-900">
                  Cancellation policy:
                </p>
                <p>
                  Free cancellation until 7+ days before check-in. After that,
                  cancellation fees may apply.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
