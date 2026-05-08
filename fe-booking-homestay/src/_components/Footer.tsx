import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
  Youtube,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0a0a0a] text-white pt-24 pb-12 overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[300px] bg-primary/5 blur-[120px] rounded-full z-0" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          {/* Brand Column */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/4stay-logo.png" alt="Logo" width={40} height={40} />
              <span className="elegant-heading text-3xl tracking-tighter text-white">
                4STAY
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs elegant-subheading">
              Trải nghiệm kỳ nghỉ hoàn hảo tại những homestay độc đáo nhất Việt
              Nam. Chúng tôi mang đến không gian sống đẳng cấp và cảm xúc trọn
              vẹn.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary transition-all duration-300 group"
                >
                  <Icon
                    size={18}
                    className="text-white group-hover:scale-110 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-8">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">
              Khám phá
            </h4>
            <ul className="space-y-4">
              {[
                "Phòng & Căn hộ",
                "Tiện ích nổi bật",
                "Địa điểm phổ biến",
                "Cẩm nang du lịch",
              ].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-white/50 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-8">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">
              Công ty
            </h4>
            <ul className="space-y-4">
              {[
                "Về chúng tôi",
                "Chính sách bảo mật",
                "Điều khoản sử dụng",
                "Liên hệ hợp tác",
              ].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-white/50 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">
              Liên hệ
            </h4>
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-primary" />
                </div>
                <span className="text-white/50 text-sm leading-snug">
                  123 Đường du lịch, Quận 1, TP. Hồ Chí Minh
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-primary" />
                </div>
                <span className="text-white/50 text-sm">+84 (123) 456 789</span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-primary" />
                </div>
                <span className="text-white/50 text-sm">contact@4stay.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/30 text-xs font-medium">
            © 2025 The 4Stay HomeStay. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link
              href="#"
              className="text-white/30 hover:text-white transition-colors text-xs font-medium"
            >
              Sơ đồ trang
            </Link>
            <Link
              href="#"
              className="text-white/30 hover:text-white transition-colors text-xs font-medium"
            >
              Quyền riêng tư
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
