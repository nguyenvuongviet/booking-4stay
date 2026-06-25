"use client";

import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import { AppConfigKey } from "@/constants/app.constant";
import { useAuth } from "@/context/auth-context";
import { submitSupportRequest } from "@/services/contactApi";
import { publicConfigApi } from "@/services/publicConfigApi";
import {
  Bot,
  ChevronRight,
  Clock,
  Headphones,
  Mail,
  MapPin,
  MessageSquareText,
  Phone,
  Send,
  Shield,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function ContactPage() {
  const { user } = useAuth();
  const [showContactForm, setShowContactForm] = useState(false);
  const [cancellationPolicy, setCancellationPolicy] = useState<
    { daysBefore: number; refundPercent: number }[]
  >([]);

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

  // Fetch cancellation policy from API
  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const configs = await publicConfigApi.getPublicConfigs();
        const policyConfig = configs.find(
          (c: any) => c.key === AppConfigKey.CANCELLATION_POLICY,
        );
        if (policyConfig) {
          const sorted = [...policyConfig.value].sort(
            (a: any, b: any) => b.daysBefore - a.daysBefore,
          );
          setCancellationPolicy(sorted);
        }
      } catch (error) {
        console.error("Failed to fetch cancellation policy", error);
      }
    };
    fetchPolicy();
  }, []);

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
    } catch {
      toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />

      {/* ─── Hero Section ─── */}
      <section className="relative pt-28 sm:pt-32 pb-24 sm:pb-32 overflow-hidden">
        {/* Background gradient mesh */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/8 via-blue-50/80 to-emerald-50/60 dark:from-primary/5 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-72 sm:w-96 h-72 sm:h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-56 sm:w-72 h-56 sm:h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-emerald-300/5 rounded-full blur-3xl pointer-events-none" />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDMiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60" />

        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-6 sm:mb-8 border border-primary/20">
            <Headphones className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Hỗ trợ 24/7
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-6 tracking-tight leading-tight">
            Chúng tôi luôn sẵn sàng
            <br className="hidden sm:block" />
            <span className="text-primary"> hỗ trợ bạn</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
            Đội ngũ 4Stay cam kết mang đến trải nghiệm tốt nhất. Liên hệ chúng
            tôi qua bất kỳ kênh nào bên dưới.
          </p>

          {/* Quick stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8">
            {[
              { icon: Zap, label: "Phản hồi nhanh", value: "< 5 phút" },
              { icon: Star, label: "Đánh giá hỗ trợ", value: "4.9/5" },
              { icon: Shield, label: "Bảo mật thông tin", value: "100%" },
            ].map((stat, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/80 dark:border-slate-700/50 shadow-sm"
              >
                <stat.icon className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Support Channels ─── */}
      <section className="px-4 sm:px-6 py-10 sm:py-16 -mt-12 sm:-mt-16 relative z-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Chatbot */}
            <Card className="group relative p-6 sm:p-8 border-0 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 rounded-2xl sm:rounded-3xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-8 -right-8 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500">
                <Bot className="w-32 h-32 sm:w-40 sm:h-40 text-blue-600" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center mb-5 sm:mb-6 shadow-lg shadow-blue-500/25">
                  <Bot className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                  Trợ lý ảo 4Stay
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 leading-relaxed">
                  Nhận hỗ trợ ngay lập tức từ AI. Giải đáp nhanh mọi thắc mắc về
                  đặt phòng, thanh toán, dịch vụ 24/7.
                </p>
                <div className="p-3 sm:p-4 bg-blue-50/80 dark:bg-blue-950/30 rounded-xl border border-blue-100/80 dark:border-blue-900/30">
                  <p className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
                    <Bot className="w-4 h-4 shrink-0" />
                    Nhấn biểu tượng Chat ở góc phải dưới màn hình
                  </p>
                </div>
              </div>
            </Card>

            {/* Host Contact */}
            <Card className="group relative p-6 sm:p-8 border-0 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 rounded-2xl sm:rounded-3xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-8 -right-8 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500">
                <MessageSquareText className="w-32 h-32 sm:w-40 sm:h-40 text-emerald-600" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center mb-5 sm:mb-6 shadow-lg shadow-emerald-500/25">
                  <MessageSquareText className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                  Nhắn tin Chủ phòng
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 leading-relaxed">
                  Trao đổi trực tiếp với chủ nhà về yêu cầu đặc biệt, hướng dẫn
                  đường đi, hoặc dịch vụ bổ sung.
                </p>
                <Link href="/inbox">
                  <Button className="w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-600/30 cursor-pointer">
                    <MessageSquareText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Mở hộp thư
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Support Ticket */}
            <Card className="group relative p-6 sm:p-8 border-0 bg-white dark:bg-slate-900 shadow-lg shadow-slate-200/50 dark:shadow-slate-900/50 rounded-2xl sm:rounded-3xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-500 overflow-hidden sm:col-span-2 lg:col-span-1">
              <div className="absolute inset-0 bg-linear-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute -top-8 -right-8 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500">
                <Mail className="w-32 h-32 sm:w-40 sm:h-40 text-orange-600" />
              </div>

              <div className="relative z-10">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-linear-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center mb-5 sm:mb-6 shadow-lg shadow-orange-500/25">
                  <Mail className="w-6 h-6 sm:w-7 sm:h-7" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2 sm:mb-3">
                  Gửi Yêu Cầu Hỗ Trợ
                </h3>
                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6 sm:mb-8 leading-relaxed">
                  Vấn đề phức tạp? Gửi ticket chi tiết để đội ngũ chuyên viên xử
                  lý nhanh chóng, chính xác.
                </p>
                <Button
                  onClick={() => setShowContactForm(!showContactForm)}
                  className="w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/20 transition-all duration-300 hover:shadow-lg hover:shadow-orange-600/30 cursor-pointer"
                >
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  {showContactForm ? "Đóng form" : "Soạn yêu cầu"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Contact Form ─── */}
      <section
        className={`px-4 sm:px-6 transition-all duration-500 ease-in-out overflow-hidden ${showContactForm ? "max-h-350 opacity-100 pb-12 sm:pb-20" : "max-h-0 opacity-0 pb-0"}`}
      >
        <div className="mx-auto max-w-3xl">
          <Card className="p-5 sm:p-8 lg:p-10 shadow-xl shadow-slate-200/60 dark:shadow-slate-900/60 border-0 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute top-0 right-0 p-6 sm:p-8 opacity-[0.03]">
              <Mail className="w-36 sm:w-48 h-36 sm:h-48 text-primary" />
            </div>

            <div className="relative z-10">
              <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    Tạo Yêu Cầu Hỗ Trợ
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Chúng tôi sẽ phản hồi trong vòng 24 giờ
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => setShowContactForm(false)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 self-end sm:self-auto"
                >
                  Đóng
                </Button>
              </div>

              <form className="space-y-5 sm:space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-11 sm:h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm sm:text-base"
                      placeholder="VD: Nguyễn Văn A"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Email liên hệ <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-11 sm:h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-sm sm:text-base"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Chủ đề cần hỗ trợ
                  </label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="flex h-11 sm:h-12 w-full items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2 text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
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
                  <label className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Nội dung chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex min-h-30 sm:min-h-40 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4 text-sm sm:text-base text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-none placeholder:text-slate-400"
                    placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải. Hãy cung cấp mã đặt phòng (nếu có) để chúng tôi hỗ trợ nhanh nhất..."
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 sm:h-12 rounded-xl text-sm sm:text-base font-semibold mt-2 shadow-md shadow-primary/20 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Đang gửi...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Gửi Yêu Cầu
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </section>

      {/* ─── Contact Info & Map ─── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Thông tin liên hệ
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
              Bạn cũng có thể liên hệ trực tiếp qua các kênh dưới đây
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
            {/* Contact Cards */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-4">
              {[
                {
                  icon: MapPin,
                  color: "text-rose-500",
                  bg: "bg-rose-50 dark:bg-rose-950/30",
                  title: "Địa chỉ",
                  detail: "01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM",
                },
                {
                  icon: Phone,
                  color: "text-emerald-500",
                  bg: "bg-emerald-50 dark:bg-emerald-950/30",
                  title: "Hotline",
                  detail: "1900 4STAY (1900 4789)",
                },
                {
                  icon: Mail,
                  color: "text-blue-500",
                  bg: "bg-blue-50 dark:bg-blue-950/30",
                  title: "Email",
                  detail: "support@4stay.vn",
                },
                {
                  icon: Clock,
                  color: "text-amber-500",
                  bg: "bg-amber-50 dark:bg-amber-950/30",
                  title: "Giờ làm việc",
                  detail: "T2 - CN: 08:00 — 22:00",
                },
              ].map((info, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${info.bg} flex items-center justify-center shrink-0`}
                  >
                    <info.icon
                      className={`w-5 h-5 sm:w-6 sm:h-6 ${info.color}`}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                      {info.title}
                    </p>
                    <p className="text-sm sm:text-base font-medium text-slate-900 dark:text-white leading-snug">
                      {info.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="lg:col-span-3 rounded-2xl sm:rounded-3xl overflow-hidden shadow-lg border border-slate-100 dark:border-slate-800 min-h-70 sm:min-h-90 lg:min-h-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.484!2d106.7588!3d10.8506!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752763f23816ab%3A0x282f711441b6916f!2zVHLGsOG7nW5nIMSQ4bqhaSBo4buNYyBTxrAgcGjhuqFtIEvhu7kgdGh14bqtdCBUUC5IQ00!5e0!3m2!1svi!2svn!4v1700000000000!5m2!1svi!2svn"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "280px" }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="4Stay Office Location"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-12 sm:py-20 px-4 sm:px-6 bg-linear-to-b from-transparent to-slate-100/50 dark:to-slate-900/50">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-semibold mb-4 sm:mb-6 border border-primary/20">
              FAQ
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Câu Hỏi Thường Gặp
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Những thắc mắc phổ biến nhất của người dùng 4Stay
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {/* FAQ 1: Cancel / Modify Booking */}
            <details className="group bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 sm:p-6 text-slate-900 dark:text-white font-semibold">
                <h3 className="text-sm sm:text-lg text-left leading-snug">
                  Làm thế nào để hủy hoặc thay đổi ngày đặt phòng?
                </h3>
                <span className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-open:bg-primary/10 group-open:text-primary group-open:rotate-90 transition-all duration-300">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </summary>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-3 sm:pt-4 mt-1 sm:mt-2 space-y-2">
                <p>
                  Vào trang <strong>Hồ sơ → Đơn đặt phòng</strong>, chọn đơn bạn
                  muốn thay đổi và nhấn vào chi tiết. Tại đây bạn có thể:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>
                    <strong>Thay đổi ngày:</strong> Nhấn nút &quot;Thay đổi
                    ngày&quot; để chọn ngày check-in/check-out mới (chỉ áp dụng
                    cho đơn chưa check-in).
                  </li>
                  <li>
                    <strong>Hủy phòng:</strong> Nhấn &quot;Hủy đặt phòng&quot;,
                    nhập lý do và thông tin ngân hàng nhận hoàn tiền. Hệ thống
                    sẽ tự động tính số tiền hoàn lại dựa trên chính sách hủy.
                  </li>
                </ul>
              </div>
            </details>

            {/* FAQ 2: Cancellation Policy — Dynamic from API */}
            <details className="group bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 sm:p-6 text-slate-900 dark:text-white font-semibold">
                <h3 className="text-sm sm:text-lg text-left leading-snug">
                  Chính sách hủy phòng và hoàn tiền như thế nào?
                </h3>
                <span className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-open:bg-primary/10 group-open:text-primary group-open:rotate-90 transition-all duration-300">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </summary>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-3 sm:pt-4 mt-1 sm:mt-2 space-y-3">
                {cancellationPolicy.length > 0 ? (
                  <>
                    <p>
                      Tỷ lệ hoàn tiền phụ thuộc vào thời điểm bạn hủy so với
                      ngày nhận phòng:
                    </p>
                    {/* Policy progress bar */}
                    <div className="relative pt-1 pb-3">
                      <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden flex">
                        {cancellationPolicy.map((rule, idx) => (
                          <div
                            key={idx}
                            className={`h-full ${
                              rule.refundPercent === 1
                                ? "bg-green-500"
                                : rule.refundPercent > 0
                                  ? "bg-amber-500"
                                  : "bg-red-500"
                            }`}
                            style={{
                              width: `${100 / cancellationPolicy.length}%`,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      {cancellationPolicy.map((rule, index) => {
                        const isFullRefund = rule.refundPercent === 1;
                        const isNoRefund = rule.refundPercent === 0;
                        let description = "";
                        if (index === 0) {
                          description = `Hủy trước ${rule.daysBefore} ngày hoặc sớm hơn`;
                        } else {
                          const prevRule = cancellationPolicy[index - 1];
                          description = `Hủy trong khoảng ${rule.daysBefore} – ${prevRule.daysBefore - 1} ngày trước khi nhận phòng`;
                        }
                        if (isNoRefund) {
                          description = `Hủy trong vòng ${cancellationPolicy[index - 1].daysBefore - 1} ngày trước khi nhận phòng hoặc muộn hơn`;
                        }
                        return (
                          <div key={index} className="flex gap-2.5 items-start">
                            <div
                              className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                                isFullRefund
                                  ? "bg-green-500"
                                  : isNoRefund
                                    ? "bg-red-500"
                                    : "bg-amber-500"
                              }`}
                            />
                            <div className="text-sm">
                              <span className="text-slate-500 dark:text-slate-400">
                                {description}
                              </span>
                              <span className="mx-2 text-slate-300 dark:text-slate-600">
                                →
                              </span>
                              <span
                                className={`font-bold ${
                                  isFullRefund
                                    ? "text-green-600"
                                    : isNoRefund
                                      ? "text-red-600"
                                      : "text-amber-600"
                                }`}
                              >
                                Hoàn tiền {rule.refundPercent * 100}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">
                      * Thời gian hoàn tiền: 3-5 ngày làm việc tùy ngân hàng.
                    </p>
                  </>
                ) : (
                  <div className="h-8 animate-pulse bg-slate-100 dark:bg-slate-800 rounded-lg" />
                )}
              </div>
            </details>

            {/* FAQ 3: Payment methods */}
            <details className="group bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 sm:p-6 text-slate-900 dark:text-white font-semibold">
                <h3 className="text-sm sm:text-lg text-left leading-snug">
                  Tôi có thể thanh toán bằng những hình thức nào?
                </h3>
                <span className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-open:bg-primary/10 group-open:text-primary group-open:rotate-90 transition-all duration-300">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </summary>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-3 sm:pt-4 mt-1 sm:mt-2 space-y-2">
                <p>4Stay hỗ trợ 2 hình thức thanh toán:</p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>
                    <strong>Thanh toán trực tuyến (PayOS/VietQR):</strong> Quét
                    mã VietQR từ bất kỳ ứng dụng ngân hàng nào. Giao dịch được
                    xác nhận tự động 24/7, không cần chờ đợi.
                  </li>
                  <li>
                    <strong>Thanh toán tiền mặt:</strong> Chuyển khoản 30% tiền
                    cọc qua ngân hàng, phần còn lại thanh toán trực tiếp bằng
                    tiền mặt khi nhận phòng.
                  </li>
                </ul>
              </div>
            </details>

            {/* FAQ 4: Contact host */}
            <details className="group bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 sm:p-6 text-slate-900 dark:text-white font-semibold">
                <h3 className="text-sm sm:text-lg text-left leading-snug">
                  Làm sao để nhắn tin với chủ nhà?
                </h3>
                <span className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-open:bg-primary/10 group-open:text-primary group-open:rotate-90 transition-all duration-300">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </summary>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-3 sm:pt-4 mt-1 sm:mt-2 space-y-2">
                <p>
                  Sau khi đặt phòng thành công, bạn có thể nhắn tin trực tiếp
                  với chủ nhà qua trang <strong>Hộp thư (Inbox)</strong>. Tại
                  đây bạn có thể:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2">
                  <li>
                    Hỏi đường đi, yêu cầu đặc biệt (giường phụ, check-in sớm...)
                  </li>
                  <li>Trao đổi về dịch vụ bổ sung tại homestay</li>
                </ul>
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                  Lưu ý: Tính năng nhắn tin chỉ khả dụng sau khi có đơn đặt
                  phòng.
                </p>
              </div>
            </details>

            {/* FAQ 5: Booking status */}
            <details className="group bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-300 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer items-center justify-between gap-3 p-4 sm:p-6 text-slate-900 dark:text-white font-semibold">
                <h3 className="text-sm sm:text-lg text-left leading-snug">
                  Các trạng thái đơn đặt phòng nghĩa là gì?
                </h3>
                <span className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-open:bg-primary/10 group-open:text-primary group-open:rotate-90 transition-all duration-300">
                  <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
              </summary>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-3 sm:pt-4 mt-1 sm:mt-2 space-y-2">
                <ul className="space-y-1.5">
                  <li>
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-500 mr-2" />
                    <strong>Chờ thanh toán:</strong> Đơn đã tạo nhưng chưa thanh
                    toán. Bạn cần hoàn tất trong thời gian quy định.
                  </li>
                  <li>
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-2" />
                    <strong>Đã xác nhận:</strong> Thanh toán thành công, đơn đã
                    được xác nhận.
                  </li>
                  <li>
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
                    <strong>Đã nhận phòng:</strong> Bạn đã check-in tại
                    homestay.
                  </li>
                  <li>
                    <span className="inline-block w-2 h-2 rounded-full bg-slate-400 mr-2" />
                    <strong>Hoàn thành:</strong> Kỳ nghỉ đã kết thúc. Bạn có thể
                    để lại đánh giá.
                  </li>
                  <li>
                    <span className="inline-block w-2 h-2 rounded-full bg-purple-500 mr-2" />
                    <strong>Chờ hoàn tiền:</strong> Đơn đã hủy, đang chờ admin
                    xử lý hoàn tiền.
                  </li>
                  <li>
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" />
                    <strong>Đã hủy / Đã hoàn tiền:</strong> Đơn đã bị hủy hoặc
                    đã hoàn tiền thành công.
                  </li>
                </ul>
              </div>
            </details>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-linear-to-br from-primary via-primary to-blue-700 p-8 sm:p-12 lg:p-16 text-center text-white shadow-2xl shadow-primary/30">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40" />
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-56 h-56 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10">
              <Headphones className="w-10 h-10 sm:w-14 sm:h-14 mx-auto mb-4 sm:mb-6 opacity-90" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight">
                Vẫn cần hỗ trợ thêm?
              </h2>
              <p className="text-sm sm:text-base text-white/80 mb-6 sm:mb-8 max-w-lg mx-auto leading-relaxed">
                Đội ngũ chuyên viên của chúng tôi luôn sẵn sàng lắng nghe và
                giải quyết mọi vấn đề của bạn.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <a href="tel:19004789">
                  <Button className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-white text-primary hover:bg-white/90 text-sm sm:text-base font-semibold shadow-lg cursor-pointer">
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Gọi Hotline
                  </Button>
                </a>
                <a href="mailto:support@4stay.vn">
                  <Button
                    variant="outline"
                    className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 rounded-xl bg-transparent! border-white/30! text-white! hover:bg-white/10! hover:text-white! text-sm sm:text-base font-semibold cursor-pointer"
                  >
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Gửi Email
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
