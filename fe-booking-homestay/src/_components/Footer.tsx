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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-250 h-75 bg-primary/5 blur-[120px] rounded-full z-0" />

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
                { name: "Phòng & Căn hộ", href: "/room" },
                { name: "Tiện ích nổi bật", href: "/room" },
                { name: "Địa điểm phổ biến", href: "/room" },
                { name: "Cẩm nang du lịch", href: "/blog" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link.name}
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
                { name: "Về chúng tôi", href: "/contact" },
                { name: "Chính sách bảo mật", href: "/contact" },
                { name: "Điều khoản sử dụng", href: "/contact" },
                { name: "Liên hệ hợp tác", href: "/contact" },
              ].map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-white/50 hover:text-primary transition-colors text-sm font-medium"
                  >
                    {link.name}
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
                  01 Đ. Võ Văn Ngân, Linh Chiểu, Thủ Đức, TP.HCM
                </span>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone size={18} className="text-primary" />
                </div>
                <a
                  href="tel:19004789"
                  className="text-white/50 hover:text-primary transition-colors text-sm font-medium"
                >
                  1900 4789
                </a>
              </li>
              <li className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail size={18} className="text-primary" />
                </div>
                <a
                  href="mailto:support@4stay.vn"
                  className="text-white/50 hover:text-primary transition-colors text-sm font-medium"
                >
                  support@4stay.vn
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-white/30 text-xs font-medium">
            © 2026 The 4Stay HomeStay. All rights reserved.
          </p>
          <div className="flex gap-8">
            <Link
              href="/"
              className="text-white/30 hover:text-white transition-colors text-xs font-medium"
            >
              Sơ đồ trang
            </Link>
            <Link
              href="/contact"
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
