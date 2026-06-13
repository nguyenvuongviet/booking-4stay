"use client";

import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import { Badge } from "@/_components/ui/badge";
import { Card } from "@/_components/ui/card";
import { useAuth } from "@/context/auth-context";
import { getPublicLoyaltyLevels, LoyaltyLevel } from "@/services/loyaltyApi";
import { ChevronRight, Gift, Medal, Star, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function LoyaltyProgramPage() {
  const { user } = useAuth();
  const [levels, setLevels] = useState<LoyaltyLevel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const data = await getPublicLoyaltyLevels();
        setLevels(data);
      } catch (error) {
        console.error("Failed to fetch loyalty levels", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLevels();
  }, []);

  const getLevelColor = (levelName: string) => {
    switch (levelName.toUpperCase()) {
      case "BRONZE":
        return "text-amber-700 bg-amber-100 border-amber-200";
      case "SILVER":
        return "text-slate-600 bg-slate-100 border-slate-200";
      case "GOLD":
        return "text-yellow-700 bg-yellow-100 border-yellow-200";
      case "PLATINUM":
        return "text-blue-700 bg-blue-100 border-blue-200";
      case "DIAMOND":
        return "text-sky-700 bg-sky-100 border-sky-200";
      default:
        return "text-primary bg-primary/10 border-primary/20";
    }
  };

  const getLevelIcon = (levelName: string) => {
    switch (levelName.toUpperCase()) {
      case "BRONZE":
        return <Medal className="w-8 h-8 text-amber-700" />;
      case "SILVER":
        return <Medal className="w-8 h-8 text-slate-600" />;
      case "GOLD":
        return <Star className="w-8 h-8 text-yellow-700" />;
      case "PLATINUM":
        return <Zap className="w-8 h-8 text-blue-700" />;
      case "DIAMOND":
        return <TrendingUp className="w-8 h-8 text-sky-700" />;
      default:
        return <Gift className="w-8 h-8 text-primary" />;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-primary/5 overflow-hidden">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-bottom" />
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="relative mx-auto max-w-5xl px-6 text-center z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Gift className="w-4 h-4" />
            <span>4Stay Rewards</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Chương Trình Khách Hàng Thân Thiết
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
            Khám phá thế giới ưu đãi độc quyền dành riêng cho bạn. Đặt phòng
            càng nhiều, đặc quyền càng lớn, trải nghiệm càng tuyệt vời.
          </p>
        </div>
      </section>

      {/* My Status Section (If logged in) */}
      {user && (
        <section className="px-6 -mt-10 relative z-20">
          <div className="mx-auto max-w-4xl">
            <Card className="p-8 border-0 shadow-xl shadow-slate-200/50 rounded-2xl bg-white flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Star className="w-48 h-48 text-primary" />
              </div>

              <div className="flex items-center gap-6 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-slate-50 shadow-md overflow-hidden bg-white">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    {getLevelIcon(
                      user.loyalty_program?.levels?.name || "Bronze",
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Xin chào, {user.firstName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    <Badge
                      className={`px-3 py-1 text-sm ${getLevelColor(user.loyalty_program?.levels?.name || "Bronze")}`}
                    >
                      {user.loyalty_program?.levels?.name || "Hạng Thành Viên"}
                    </Badge>
                    <span className="text-slate-500 font-medium text-sm flex items-center gap-1">
                      <Zap className="w-4 h-4 text-amber-500" />
                      {user.loyalty_program?.totalPoint || 0} Điểm tích luỹ
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10 w-full md:w-auto">
                <Link
                  href="/profile?tab=rewards"
                  className="inline-flex justify-center items-center h-12 px-6 rounded-xl text-base font-medium bg-primary text-white hover:bg-primary/90 transition-colors w-full md:w-auto"
                >
                  Xem chi tiết điểm thưởng
                </Link>
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Tiers Grid Section */}
      <section className={`px-6 py-20 ${user ? "mt-10" : ""}`}>
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Các Cấp Độ Thành Viên
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hệ thống cấp độ được thiết kế để tri ân sự ủng hộ của bạn. Mỗi mức
              hạng mang đến những ưu đãi giảm giá và đặc quyền riêng biệt.
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {levels.map((level) => (
                <Card
                  key={level.id}
                  className={`p-6 border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] dark:bg-slate-900/40 dark:border-white/10 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2`}
                >
                  <div
                    className={`absolute inset-0 opacity-10 bg-gradient-to-br from-white/40 to-transparent pointer-events-none`}
                  ></div>
                  <div className="absolute -right-6 -top-6 opacity-20 drop-shadow-md">
                    {getLevelIcon(level.name)}
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div
                        className={`p-3 rounded-xl bg-white/60 backdrop-blur-md shadow-sm border border-white/50`}
                      >
                        {getLevelIcon(level.name)}
                      </div>
                      <h3
                        className={`text-2xl font-bold drop-shadow-sm ${getLevelColor(level.name).split(" ")[0]}`}
                      >
                        {level.name}
                      </h3>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Điều kiện đạt hạng
                        </p>
                        <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                          {level.minPoints.toLocaleString("vi-VN")}{" "}
                          <span className="text-sm font-normal text-slate-500">
                            điểm
                          </span>
                        </p>
                      </div>

                      <div className="bg-white/40 backdrop-blur-md p-4 rounded-xl border border-white/50 shadow-inner">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                          Ưu đãi giảm giá
                        </p>
                        <div className="flex items-baseline gap-1">
                          <span
                            className={`text-3xl font-bold ${getLevelColor(level.name).split(" ")[0]}`}
                          >
                            {level.discountPercent}%
                          </span>
                          <span className="text-sm font-medium text-slate-600">
                            trên tổng hoá đơn
                          </span>
                        </div>
                        {level.maxDiscountAmount > 0 && (
                          <p className="text-sm text-slate-500 mt-2">
                            Giảm tối đa:{" "}
                            <span className="font-semibold text-slate-700">
                              {" "}
                              {level.maxDiscountAmount.toLocaleString("vi-VN")}đ
                            </span>
                          </p>
                        )}
                      </div>

                      {level.description && (
                        <p className="text-slate-600 leading-relaxed text-sm">
                          {level.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Làm Thế Nào Để Tham Gia?
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Hành trình trở thành khách hàng thân thiết của 4Stay rất đơn giản.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Đặt phòng & Trải nghiệm",
                desc: "Thực hiện đặt phòng trên 4Stay. Điểm chỉ được cộng sau khi bạn hoàn thành kỳ nghỉ và thanh toán thành công.",
                icon: <Star className="w-8 h-8 text-primary" />,
              },
              {
                step: "02",
                title: "Tích luỹ điểm số",
                desc: "Nhận 1 điểm thưởng cho mỗi 1.000 VNĐ chi tiêu. Ví dụ: Hoá đơn 1.000.000 VNĐ = 1.000 điểm.",
                icon: <Zap className="w-8 h-8 text-primary" />,
              },
              {
                step: "03",
                title: "Thăng hạng & Nhận ưu đãi",
                desc: "Khi đạt đủ số điểm yêu cầu, bạn sẽ tự động được thăng hạng và tận hưởng mức giảm giá lên đến 15% cho các lần đặt phòng tiếp theo.",
                icon: <TrendingUp className="w-8 h-8 text-primary" />,
              },
            ].map((item, index) => (
              <div
                key={index}
                className="relative p-6 bg-slate-50 rounded-2xl text-center group hover:bg-primary/5 transition-colors"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-slate-300 shadow-sm border border-slate-100 group-hover:text-primary transition-colors">
                  {item.step}
                </div>
                <div className="mt-6 mb-4 flex justify-center">
                  <div className="p-4 bg-primary/10 rounded-2xl text-primary">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-50">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-10 text-center">
            Câu Hỏi Thường Gặp
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Làm thế nào để tích điểm?",
                a: "Bạn sẽ nhận được 1 điểm thưởng cho mỗi 1.000 VNĐ thanh toán cho đơn đặt phòng đã hoàn thành. Điểm được cộng vào tài khoản trong vòng 24h sau khi bạn trả phòng (check-out) thành công.",
              },
              {
                q: "Điểm thưởng có hạn sử dụng không?",
                a: "Điểm thưởng hiện tại không có hạn sử dụng. Tuy nhiên, chúng tôi có quyền thay đổi chính sách này và sẽ thông báo trước cho bạn nếu có thay đổi.",
              },
              {
                q: "Tôi có thể chuyển nhượng điểm thưởng không?",
                a: "Rất tiếc, điểm thưởng và cấp độ thành viên là đặc quyền cá nhân và không thể chuyển nhượng cho tài khoản khác dưới bất kỳ hình thức nào.",
              },
              {
                q: "Làm sao để áp dụng ưu đãi giảm giá của cấp độ?",
                a: "Khi bạn đạt được một cấp độ mới, mức giảm giá tương ứng sẽ tự động được áp dụng vào các đơn đặt phòng tiếp theo của bạn trong bước thanh toán.",
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
                <div className="px-6 pb-6 text-slate-600 leading-relaxed">
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
