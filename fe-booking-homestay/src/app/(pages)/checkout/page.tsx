"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { create_booking, room_detail } from "@/services/bookingApi";
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group";
import { format, parse, parseISO } from "date-fns";
import {
  ArrowLeft,
  Building2,
  Check,
  CreditCard,
  DollarSign,
  Wallet,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

type PaymentMethod = "zalo" | "momo" | "paypal" | "card" | "money";

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("money");
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

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
        // checkIn: format(ci!, "dd/MM/yyyy"),
        // checkOut: format(co!, "dd/MM/yyyy"),
        checkIn: format(parse(ci!, "dd/MM/yyyy", new Date()), "yyyy-MM-dd"),
        checkOut: format(parse(co!, "dd/MM/yyyy", new Date()), "yyyy-MM-dd"),
        adults: Number(ad),
        children: Number(ch),
      });
      toast.success("Booking confirmed! Thank you for your reservation.");
      console.log("Booking created successfully:", resp);
      setTimeout(() => {
        router.push("/booking");
      }, 5000);
    } catch (error) {
      console.error("Error creating booking:", error);
    }

    // For demo purposes, just log the details
    console.log("[v0] Confirming booking with payment method:", paymentMethod);
    console.log("[v0] Card details:", cardDetails);
    // In real app, process payment here
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

  const parsedCheckIn = ci ? parse(ci, "dd/MM/yyyy", new Date()) : null;
  const parsedCheckOut = co ? parse(co, "dd/MM/yyyy", new Date()) : null;

  const bookingData = {
    hotelName: room?.name,
    roomType: room?.description,
    checkIn: parsedCheckIn ? format(parsedCheckIn, "dd/MM/yyyy") : "",
    checkOut: parsedCheckOut ? format(parsedCheckOut, "dd/MM/yyyy") : "",
    nights:
      parsedCheckIn && parsedCheckOut
        ? (parsedCheckOut.getTime() - parsedCheckIn.getTime()) /
          (1000 * 60 * 60 * 24)
        : 1,
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
                      paymentMethod === "money"
                        ? "border-primary bg-primary-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="money" id="money" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Cash Payment
                        </p>
                        <p className="text-sm text-gray-600">
                          Direct cash payment upon arrival
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "money" && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </label>
                  {/* PayPal */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "paypal"
                        ? "border-primary bg-primary-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="paypal" id="paypal" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Wallet className="h-5 w-5 text-blue-900" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">PayPal</p>
                        <p className="text-sm text-gray-600">
                          Pay securely with your PayPal account
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "paypal" && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </label>

                  {/* Momo */}
                  <label
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
                  </label>

                  {/* Zalopay */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "zalo"
                        ? "border-primary bg-primary-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="zalo" id="zalo" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Zalopay</p>
                        <p className="text-sm text-gray-600">
                          Pay securely with your Zalopay account
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "zalo" && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </label>

                  {/* Bank Transfer */}
                  <label
                    className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === "card"
                        ? "border-primary bg-primary-100"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Credit Card, Debit Card, MasterCard
                        </p>
                        <p className="text-sm text-gray-600">
                          Pay securely using your credit card
                        </p>
                      </div>
                    </div>
                    {paymentMethod === "card" && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </label>
                </div>
              </RadioGroup>

              {/* Momo Info */}
              {paymentMethod === "momo" && (
                <div className="mt-6 p-4 bg-pink-50 rounded-lg border border-pink-200">
                  <p className="text-sm text-gray-700">
                    You will be redirected to Momo to complete your payment
                    securely.
                  </p>
                </div>
              )}

              {/* Momo Info */}
              {paymentMethod === "zalo" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    You will be redirected to Zalopay to complete your payment
                    securely.
                  </p>
                </div>
              )}

              {/* PayPal Info */}
              {paymentMethod === "paypal" && (
                <div className="mt-6 p-4 bg-blue-100 rounded-lg border border-blue-300">
                  <p className="text-sm text-gray-700">
                    You will be redirected to PayPal to complete your payment
                    securely.
                  </p>
                </div>
              )}

              {/* Bank Transfer Info */}
              {paymentMethod === "card" && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-sm text-gray-700 mb-2">
                    Bank transfer details will be provided after booking
                    confirmation.
                  </p>
                  <p className="text-xs text-gray-600">
                    Please complete the transfer within 24 hours to secure your
                    reservation.
                  </p>
                </div>
              )}
              {/* PayPal Info */}
              {paymentMethod === "money" && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    You will be paying with cash upon arrival at the hotel.
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
            <Card className="p-6 sticky top-10 space-y-6">
              <h2 className="text-2xl elegant-heading mb-4">Booking Summary</h2>
              <div className="w-full h-50 rounded-lg overflow-hidden">
                <img
                  src={bookingData.hotelImage || "/placeholder.svg"}
                  alt="Hotel img"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Hotel Details */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
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
