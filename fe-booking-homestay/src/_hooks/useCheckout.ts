import { usePayment } from "@/_hooks/usePayment";
import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import { Room } from "@/models/Room";
import { room_detail, room_preview } from "@/services/roomApi";
import { PaymentMethod } from "@/types/paymentmethod";
import toast from "react-hot-toast";

import { differenceInDays, format, parseISO } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { BookingPre } from "@/models/BookingPre";

export function useCheckout() {
    const { user } = useAuth();
    const { t } = useLang();
    const searchParams = useSearchParams();

    const roomId = searchParams.get("roomId");
    const adults = searchParams.get("adults");
    const children = searchParams.get("children");
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut");
    const parsedCheckIn = checkIn ? parseISO(checkIn) : null;
    const parsedCheckOut = checkOut ? parseISO(checkOut) : null;
    
    const [room, setRoom] = useState<Room | null>(null);
    const [bookingPre, setBookingPre] = useState< BookingPre | null>(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!roomId) return;

        const fetchRoom = async () => {
            try {
                const room = await room_detail(roomId);
                setRoom(room);

                const data = await room_preview(
                    Number(roomId),
                    format(bookingData.checkIn, "yyyy-MM-dd"),
                    format(bookingData.checkOut, "yyyy-MM-dd")
                );
                setBookingPre(data);

                if (data.available === false) {
                    toast.error("Phòng này đã hết!");
                }

            } catch (error) {
                console.error("Fetch room failed", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRoom();
    }, [roomId]);

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [phone, setPhone] = useState("");
    const [firstNameError, setFirstNameError] = useState("");
    const [lastNameError, setLastNameError] = useState("");
    const [phoneError, setPhoneError] = useState("");
    const [emailError, setEmailError] = useState("");

    useEffect(() => {
        if (!user) return;

        setFirstName(user.firstName ?? "");
        setLastName(user.lastName ?? "");
        setEmailInput(user.email ?? "");
        setPhone(user.phoneNumber ?? "");
    }, [user]);

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
    const [specialRequests, setSpecialRequests] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const bookingData = {
        roomName: room?.name ?? "",
        roomType: room?.description ?? "",
        checkIn: parsedCheckIn ? format(parsedCheckIn, "yyyy-MM-dd") : "",
        checkOut: parsedCheckOut ? format(parsedCheckOut, "yyyy-MM-dd") : "",
        adults,
        children,
        pricePerNight: bookingPre?.priceSummary.averagePricePerNight ?? 0,
        rawTotal: bookingPre?.priceSummary.rawTotal ?? 0,
        totalAmount: bookingPre?.priceSummary?.totalPrice ?? 0,
        discountPercent: bookingPre?.priceSummary?.discountPercent ?? 0,
        roomImage: room?.images?.main ?? "",
    };

    const totalNights =
        parsedCheckIn && parsedCheckOut
            ? differenceInDays(parsedCheckOut, parsedCheckIn)
            : 0;

    const payment = usePayment(room, bookingData, bookingPre?.available);

    const confirmNow = async () => {
        if (!roomId || !checkIn || !checkOut) return;

        setIsLoading(true);

        await payment.handleDepositNow({
            roomId,
            checkIn,
            checkOut,
            adults: Number(adults),
            children: Number(children),
            guestFullName: `${firstName} ${lastName}`,
            guestEmail: emailInput,
            guestPhoneNumber: phone,
            specialRequest: specialRequests,
            paymentMethod
        }).finally(() => setIsLoading(false));
    };

    const confirmLater = async () => {
        if (!roomId || !checkIn || !checkOut) return;

        setIsLoading(true);

        await payment.handleDepositLater({
            roomId,
            checkIn,
            checkOut,
            adults: Number(adults),
            children: Number(children),
            guestFullName: `${firstName} ${lastName}`,
            guestEmail: emailInput,
            guestPhoneNumber: phone,
            specialRequest: specialRequests,
            paymentMethod
        }).finally(() => setIsLoading(false));
    };

    const validateGuestInfo = () => {
        let isValid = true;

        if (!firstName.trim()) {
            document.getElementById("firstName")?.focus();
            setFirstNameError("Vui lòng nhập tên");
            isValid = false;
        } else setFirstNameError("");

        if (!lastName.trim()) {
            document.getElementById("lastName")?.focus();
            setLastNameError("Vui lòng nhập họ");
            isValid = false;
        } else setLastNameError("");

        if (!emailInput.trim()) {
            document.getElementById("emailInput")?.focus();
            setEmailError("Vui lòng nhập email");
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(emailInput)) {
            document.getElementById("firstName")?.focus();
            setEmailError("Email không hợp lệ");
            isValid = false;
        } else setEmailError("");

        if (!phone.trim()) {
            document.getElementById("phone")?.focus();
            setPhoneError("Vui lòng nhập số điện thoại");
            isValid = false;
        } else if (!/^0\d{9}$/.test(phone)) {
            document.getElementById("phone")?.focus();
            setPhoneError("SĐT không hợp lệ");
            isValid = false;
        } else setPhoneError("");

        return isValid;
    };

    return {
        ...payment,

        room,
        loading,

        bookingData,
        totalNights,

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

        isLoading,
        confirmNow,
        confirmLater,
        validateGuestInfo,
    };
}