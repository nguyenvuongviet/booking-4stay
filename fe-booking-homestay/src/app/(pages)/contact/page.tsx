"use client";

import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import { Button } from "@/_components/ui/button";
import { Card } from "@/_components/ui/card";
import { Input } from "@/_components/ui/input";
import {
  Bot,
  ChevronRight,
  Mail,
  MessageCircle,
  MessageSquareText,
  Search,
  User,
} from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      {/* Hero Section with Search */}
      <section className="relative pt-32 pb-20 bg-primary/5">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-position-[bottom_1px_center] dark:bg-grid-slate-900/[0.04] dark:bg-bottom" />
        <div className="relative mx-auto max-w-4xl px-6 text-center z-10">
          <h1 className="text-xl md:text-3xl font-bold text-slate-900 mb-6">
            Xin chào, chúng tôi có thể giúp gì cho bạn?
          </h1>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Tìm kiếm câu trả lời nhanh chóng hoặc kết nối với đội ngũ hỗ trợ và
            chủ nhà của chúng tôi.
          </p>

          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nhập câu hỏi của bạn (VD: Làm sao để hủy phòng?)"
              className="h-16 pl-14 pr-32 text-lg rounded-full shadow-lg border-0 focus-visible:ring-primary/20 bg-white"
            />
            <Button className="absolute right-2 top-2 h-12 rounded-full px-6">
              Tìm kiếm
            </Button>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="px-6 py-16 -mt-10 relative z-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Chatbot / Live Chat */}
            <Card className="p-8 border-0 shadow-xl shadow-slate-200/50 rounded-2xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageSquareText className="w-32 h-32 text-primary" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6 relative z-10">
                <Bot className="w-7 h-7" />
              </div>
              <h3 className="text-xl elegant-sans relative z-10">Trợ lý ảo</h3>
              <p className="text-muted-foreground mb-8 relative z-10 min-h-[48px]">
                Chat với Bot để giải đáp nhanh các câu hỏi phổ biến.
              </p>
              <Button className="w-full h-12 rounded-xl text-base bg-blue-600 hover:bg-blue-700 relative z-10 text-white">
                <MessageCircle className="w-5 h-5 mr-2" /> Bắt đầu Chat
              </Button>
              <div className="mt-3 text-center">
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                  Tính năng sắp ra mắt
                </span>
              </div>
            </Card>

            {/* Host Contact */}
            <Card className="p-8 border-0 shadow-xl shadow-slate-200/50 rounded-2xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <User className="w-32 h-32 text-emerald-600" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6 relative z-10">
                <User className="w-7 h-7" />
              </div>
              <h3 className="text-xl elegant-sans relative z-10">
                Liên hệ Chủ Nhà
              </h3>
              <p className="text-muted-foreground mb-6 relative z-10 min-h-[48px]">
                Bạn có yêu cầu đặc biệt về chỗ ở? Trò chuyện trực tiếp với chủ
                nhà để được hỗ trợ tốt nhất.
              </p>
              <Button className="w-full h-12 rounded-xl text-base bg-emerald-600 hover:bg-emerald-700 relative z-10 text-white">
                <MessageSquareText className="w-5 h-5 mr-2" /> Nhắn tin cho Chủ
                Nhà
              </Button>
              <div className="mt-3 text-center">
                <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  Tính năng sắp ra mắt
                </span>
              </div>
            </Card>

            {/* Support Ticket */}
            <Card className="p-8 border-0 shadow-xl shadow-slate-200/50 rounded-2xl hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Mail className="w-32 h-32 text-orange-600" />
              </div>
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mb-6 relative z-10">
                <Mail className="w-7 h-7" />
              </div>
              <h3 className="text-xl elegant-sans relative z-10">
                Gửi Yêu Cầu Hỗ Trợ
              </h3>
              <p className="text-muted-foreground mb-6 relative z-10 min-h-12">
                Đối với các vấn đề phức tạp, cần đính kèm hình ảnh hoặc file,
                vui lòng gửi ticket cho chúng tôi.
              </p>
              <Button
                onClick={() => setShowContactForm(!showContactForm)}
                className="w-full h-12 rounded-xl text-base bg-orange-600 hover:bg-orange-700 relative z-10 text-white"
              >
                <Mail className="w-5 h-5 mr-2" /> Soạn Yêu Cầu
              </Button>
              <div className="mt-3 text-center">
                <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                  Phản hồi qua Email (24h)
                </span>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Traditional Contact / Form Section */}
      <section
        className={`px-6 transition-all duration-500 overflow-hidden ${showContactForm ? "max-h-[1000px] opacity-100 py-10" : "max-h-0 opacity-0 py-0"}`}
      >
        <div className="mx-auto max-w-4xl">
          <Card className="p-8 shadow-md border-slate-100 bg-white rounded-2xl">
            <div className="mb-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-slate-900">
                Chi tiết yêu cầu hỗ trợ
              </h3>
              <Button variant="ghost" onClick={() => setShowContactForm(false)}>
                Đóng
              </Button>
            </div>
            <form className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Họ và tên
                  </label>
                  <Input
                    className="h-12 rounded-xl bg-slate-50"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Email
                  </label>
                  <Input
                    className="h-12 rounded-xl bg-slate-50"
                    placeholder="email@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Vấn đề cần hỗ trợ
                </label>
                <select className="flex h-12 w-full items-center justify-between rounded-xl border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option>Hỗ trợ đặt phòng</option>
                  <option>Vấn đề thanh toán</option>
                  <option>Khiếu nại về chất lượng chỗ ở</option>
                  <option>Trở thành đối tác (Chủ nhà)</option>
                  <option>Khác</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  Nội dung chi tiết
                </label>
                <textarea
                  className="flex min-h-[120px] w-full rounded-xl border border-input bg-slate-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none p-4"
                  placeholder="Mô tả chi tiết vấn đề bạn đang gặp phải..."
                />
              </div>
              <Button className="w-full h-12 rounded-xl text-lg mt-4">
                Gửi Yêu Cầu
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* FAQ Quick Links */}
      <section className="bg-white py-20 border-t border-slate-100 mt-10">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">
            Câu hỏi thường gặp
          </h2>
          <div className="grid gap-4">
            {[
              "Làm thế nào để thay đổi hoặc hủy đặt phòng?",
              "Chính sách hoàn tiền của 4Stay như thế nào?",
              "Làm sao để liên lạc với chủ nhà trước khi đặt?",
              "Tôi có thể thanh toán bằng những hình thức nào?",
            ].map((faq, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 hover:bg-primary/5 cursor-pointer transition-colors group"
              >
                <span className="font-medium text-slate-700 group-hover:text-primary">
                  {faq}
                </span>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-transform group-hover:translate-x-1" />
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button
              variant="outline"
              className="rounded-xl h-12 px-8 font-medium"
            >
              Xem tất cả câu hỏi
            </Button>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
