"use client";

import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { useAuth } from "@/context/auth-context";
import { submitSupportRequest } from "@/services/contactApi";
import {
  Bot,
  ChevronRight,
  Mail,
  MessageSquareText,
  User
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Hỗ trợ đặt phòng");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(
        `${user.firstName || ""} ${user.lastName || ""}`.trim() || "",
      );
      setEmail(user.email || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !message) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitSupportRequest({
        fullName,
        email,
        message: `[${topic}] ${message}`,
      });
      toast.success("Yêu cầu hỗ trợ đã được gửi thành công!");
      setMessage("");
      setShowContactForm(false);
    } catch (error) {
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section with Search */}
      <section className="relative pt-32 pb-20 bg-primary/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-bottom" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-6 text-center z-10">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Xin chào, chúng tôi có thể giúp gì cho bạn?
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Tìm kiếm câu trả lời nhanh chóng hoặc kết nối với đội ngũ hỗ trợ của
            chúng tôi.
          </p>
        </div>
      </section>

      {/* Support Channels */}
      <section className="px-6 py-16 -mt-10 relative z-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Chatbot / Live Chat */}
            <Card className="p-8 border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
              <div className="absolute -top-6 -right-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageSquareText className="w-40 h-40 text-blue-600" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-6 relative z-10 shadow-sm border border-blue-200/50">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">
                Trợ lý ảo 4Stay
              </h3>
              <p className="text-slate-600 mb-8 relative z-10 min-h-[48px]">
                Bạn cần hỗ trợ ngay lập tức? Trợ lý ảo của chúng tôi luôn sẵn
                sàng giải đáp các thắc mắc thường gặp 24/7.
              </p>
              <div className="relative z-10 text-center p-4 bg-blue-50/80 rounded-xl border border-blue-100">
                <p className="text-sm font-medium text-blue-700">
                  Nhấn vào biểu tượng Chat{" "}
                  <Bot className="w-5 h-5 inline-block mx-1" /> ở góc phải dưới
                  màn hình để bắt đầu.
                </p>
              </div>
            </Card>

            {/* Host Contact */}
            <Card className="p-8 border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
              <div className="absolute -top-6 -right-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <User className="w-40 h-40 text-emerald-600" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center mb-6 relative z-10 shadow-sm border border-emerald-200/50">
                <User className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">
                Liên hệ Chủ phòng
              </h3>
              <p className="text-slate-600 mb-8 relative z-10 min-h-[48px]">
                Bạn có yêu cầu đặc biệt về chỗ ở hoặc cần hỏi đường? Trò chuyện
                trực tiếp với chủ phòng để được hỗ trợ.
              </p>
              <Link href="/inbox" className="relative z-10">
                <Button className="w-full h-12 rounded-xl text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                  <MessageSquareText className="w-5 h-5 mr-2" /> Nhắn tin cho
                  chủ phòng
                </Button>
              </Link>
            </Card>

            {/* Support Ticket */}
            <Card className="p-8 border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
              <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-white/40 to-transparent pointer-events-none"></div>
              <div className="absolute -top-6 -right-6 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Mail className="w-40 h-40 text-orange-600" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-100/80 text-orange-600 flex items-center justify-center mb-6 relative z-10 shadow-sm border border-orange-200/50">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3 relative z-10">
                Gửi Yêu Cầu Hỗ Trợ
              </h3>
              <p className="text-slate-600 mb-6 relative z-10 min-h-[48px]">
                Đối với các vấn đề thanh toán hoặc tranh chấp cần xử lý chi
                tiết, vui lòng gửi ticket cho đội ngũ của chúng tôi.
              </p>
              <Button
                onClick={() => setShowContactForm(!showContactForm)}
                className="w-full h-12 rounded-xl text-base bg-orange-600 hover:bg-orange-700 relative z-10 text-white shadow-md"
              >
                <Mail className="w-5 h-5 mr-2" /> Soạn yêu cầu
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Traditional Contact / Form Section */}
      <section
        className={`px-6 transition-all duration-500 overflow-hidden ${showContactForm ? "max-h-[1200px] opacity-100 pb-20" : "max-h-0 opacity-0 pb-0"}`}
      >
        <div className="mx-auto max-w-3xl">
          <Card className="p-8 shadow-xl shadow-slate-200/50 border-0 bg-white rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Mail className="w-48 h-48 text-primary" />
            </div>
            <div className="relative z-10">
              <div className="mb-8 flex justify-between items-center border-b border-slate-100 pb-4">
                <h3 className="text-2xl font-bold text-slate-900">
                  Tạo Yêu Cầu Hỗ Trợ Mới
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowContactForm(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  Đóng Form
                </Button>
              </div>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Họ và tên
                    </label>
                    <Input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200"
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">
                      Email liên hệ
                    </label>
                    <Input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-slate-200"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Chủ đề cần hỗ trợ
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex h-12 w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                  >
                    <option>Hỗ trợ đặt phòng</option>
                    <option>Vấn đề thanh toán</option>
                    <option>Khiếu nại về chất lượng chỗ ở</option>
                    <option>Thay đổi tài khoản</option>
                    <option>Báo cáo sự cố</option>
                    <option>Khác</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Nội dung chi tiết
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex min-h-[160px] w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-none"
                    placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải. Hãy cung cấp mã đặt phòng (nếu có) để chúng tôi hỗ trợ nhanh nhất..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 rounded-xl text-base font-medium mt-4 shadow-md"
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi Yêu Cầu"}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="py-20 border-t border-slate-100 mt-10">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Câu Hỏi Thường Gặp
            </h2>
            <p className="text-slate-600">
              Những thắc mắc phổ biến nhất của người dùng 4Stay
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Làm thế nào để thay đổi hoặc hủy đặt phòng?",
                a: "Để hủy hoặc thay đổi đặt phòng, bạn vui lòng vào mục Lịch sử đặt phòng trong Profile. Tùy thuộc vào chính sách hủy của từng nhà, hệ thống sẽ tự động tính toán số tiền hoàn lại (nếu có).",
              },
              {
                q: "Chính sách hoàn tiền của 4Stay như thế nào?",
                a: "Tiền sẽ được hoàn lại về phương thức thanh toán ban đầu của bạn trong vòng 3-5 ngày làm việc sau khi yêu cầu hủy được chấp nhận. Số tiền hoàn lại phụ thuộc vào thời điểm bạn hủy so với ngày nhận phòng.",
              },
              {
                q: "Làm sao để liên lạc với chủ nhà trước khi đặt?",
                a: "Rất tiếc, bạn chỉ có thể nhắn tin với chủ nhà sau khi đặt phòng thành công. Tuy nhiên, nếu có thắc mắc gấp, bạn có thể gọi hotline hỗ trợ của 4Stay.",
              },
              {
                q: "Tôi có thể thanh toán bằng những hình thức nào?",
                a: "4Stay hỗ trợ thanh toán trực tuyến qua thẻ tín dụng (Visa, Mastercard), thẻ ATM nội địa, chuyển khoản ngân hàng (PayOS) và các ví điện tử phổ biến tại Việt Nam.",
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-1.5 p-6 text-slate-900 font-semibold">
                  <h3 className="text-lg">{faq.q}</h3>
                  <span className="shrink-0 rounded-full bg-slate-50 p-2 text-slate-500 group-open:bg-primary/10 group-open:text-primary group-open:-rotate-90 transition-all">
                    <ChevronRight className="h-5 w-5" />
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 leading-relaxed border-t border-slate-50 pt-4 mt-2">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
