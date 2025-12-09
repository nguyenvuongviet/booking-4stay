"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="relative pt-28 pb-20 bg-linear-to-br from-primary/10 via-white to-secondary/10">
        <div className="mx-auto max-w-5xl px-8 text-center">
          <h1 className="text-5xl elegant-heading text-gray-900 font-bold mb-4">
            Liên hệ 4Stay
          </h1>
          <p className="text-lg elegant-subheading text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Bạn gặp vấn đề khi đặt phòng, thanh toán, hay đơn giản muốn hợp tác?
            Chúng tôi luôn sẵn sàng hỗ trợ bạn nhanh nhất có thể.
          </p>
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-3">
          <div className="space-y-6 lg:pr-6">
            <Card className="p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-blue-100 p-3">
                  <Mail className="h-6 w-6 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-xl elegant-sans font-semibold">Email</h3>
                  <p className="mt-1 text-muted-foreground">
                    support@4stay.com
                  </p>
                  <p className="text-sm text-gray-400">
                    Thời gian phản hồi: dưới 24 giờ
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-indigo-100 p-3">
                  <Phone className="h-6 w-6 text-indigo-700" />
                </div>
                <div>
                  <h3 className="text-xl elegant-sans font-semibold">
                    Hotline
                  </h3>
                  <p className="mt-1 text-muted-foreground">+84 909 123 456</p>
                  <p className="text-sm text-gray-400">
                    Hỗ trợ 7 ngày/tuần – 7:00 đến 22:00
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-purple-100 p-3">
                  <MapPin className="h-6 w-6 text-purple-700" />
                </div>
                <div>
                  <h3 className="text-xl elegant-sans font-semibold">
                    Văn phòng
                  </h3>
                  <p className="mt-1 text-muted-foreground">
                    1 Võ Văn Ngân, Thủ Đức
                  </p>
                  <p className="text-sm text-gray-400">
                    TP. Hồ Chí Minh, Việt Nam
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="p-10 shadow-md border bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Họ và tên
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      required
                      placeholder="Nguyễn Văn A..."
                      onChange={handleChange}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800">
                      Email
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      required
                      placeholder="email@example.com"
                      onChange={handleChange}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Tiêu đề
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    required
                    placeholder="Bạn muốn trao đổi về điều gì?"
                    onChange={handleChange}
                    className="mt-2 h-12 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800">
                    Nội dung
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    required
                    placeholder="Hãy mô tả chi tiết yêu cầu của bạn..."
                    onChange={handleChange}
                    rows={6}
                    className="mt-2 rounded-xl"
                  />
                </div>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-xl text-lg"
                >
                  <Send className="mr-2 h-5 w-5" />
                  Gửi Tin Nhắn
                </Button>

                {submitted && (
                  <div className="rounded-lg bg-green-50 p-4 text-green-700 text-center">
                    Cảm ơn bạn! Chúng tôi sẽ phản hồi sớm nhất.
                  </div>
                )}
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
