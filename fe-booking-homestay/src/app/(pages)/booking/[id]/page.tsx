import React, { useEffect, useState } from "react";
import { Booking } from "@/models/Booking";
import BookingDetailClient  from "@/components/bookings/BookingDetailClient";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { get_booking_detail } from "@/services/bookingApi";

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; // ✅ unwrap Promise theo React 19
  return <BookingDetailClient bookingId={id} />;
}






// export default function HistoryDetail({ params }: { params: Promise<{ id: string }> }) {
//   const [booking, setBooking] = useState<Booking | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();
//   const handleCancel = (id: number) => {
//     // if (!confirm("Bạn có chắc muốn hủy booking này không?")) return;
//     // setBooking((prev) => ({
//     //   ...prev,
//     //   status: "CANCELLED",
//     //   cancelReason: "Khách hàng hủy do thay đổi kế hoạch.",
//     // }));if (!confirm("Bạn có chắc muốn hủy booking này không?")) return;

//     try {
//       // 🔹 Gọi API hủy (nếu có)
//       // const res = await cancel_booking(id);
//       // setBooking(res.data);

//       // 🔹 Giả lập UI cập nhật sau khi hủy
//       setBooking((prev) =>
//         prev
//           ? {
//               ...prev,
//               status: "CANCELLED",
//               cancelReason: "Khách hàng đã hủy đặt phòng.",
//             }
//           : prev
//       );
//     } catch (err) {
//       console.error("Cancel booking failed:", err);
//       alert("Hủy booking thất bại. Vui lòng thử lại!");
//     }
//   };

//   useEffect(() => {
//     const fetchBooking = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const res = await get_booking_detail(params.id);
//         console.log("Booking detail API response:", res);

//         if (!res || !res.data?.booking) {
//           throw new Error("Không tìm thấy thông tin đặt phòng.");
//         }

//         setBooking(res.data.booking);
//       } catch (err: any) {
//         console.error("Fetch booking error:", err);
//         setError(err.message || "Đã xảy ra lỗi khi tải thông tin đặt phòng.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchBooking();
//   }, [params.id]);  

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen text-gray-500">
//         Đang tải thông tin đặt phòng...
//       </div>
//     );
//   }
//   // ❌ Trạng thái lỗi
//   if (error) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen text-center">
//         <p className="text-red-500 mb-4">{error}</p>
//         <button
//           onClick={() => router.push("/booking")}
//           className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition"
//         >
//           Quay lại danh sách
//         </button>
//       </div>
//     );
//   }

//   // ⚠️ Không có dữ liệu booking
//   if (!booking) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen text-gray-500">
//         Không có dữ liệu đặt phòng.
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-background border-b sticky top-0 z-50 mb-8">
//         <div className="max-w-5xl mx-auto px-10 py-4">
//           <button
//             onClick={() => router.push(`/booking`)}
//             className="px-4 flex items-center gap-2 text-gray-900 hover:text-primary hover:cursor-pointer"
//           >
//             <ArrowLeft className="h-5 w-5" />
//             <span className="elegant-subheading">Back to hotel</span>
//           </button>
//         </div>
//       </header>
//       <div className="max-w-4xl mx-auto ">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">
//           Chi tiết đặt phòng
//         </h1>
//         <BookingDetail booking={booking} onCancel={handleCancel} />
//       </div>
//     </div>
//   );
// }