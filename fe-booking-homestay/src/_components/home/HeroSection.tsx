"use client";

import { useAuth } from "@/context/auth-context";
import { useLang } from "@/context/lang-context";
import ScrollFade from "@/styles/animations/ScrollFade";
import Typing from "@/styles/animations/Typing";
import { motion } from "framer-motion";

export default function HeroSection() {
  const { lang, t } = useLang();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-20 pb-12 z-0 overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover -z-10 scale-105"
        src="https://res.cloudinary.com/nguyenvuongviet/video/upload/v1765448600/video_bg_omgnlu.mp4"
      />

      {/* LAYER LÀM MỜ + TỐI */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] -z-10" />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10 transform -translate-y-6 sm:-translate-y-8 md:-translate-y-14 lg:-translate-y-16">
        <div className="mb-6 md:mb-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {user && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-accent/90 text-sm sm:text-base md:text-xl elegant-subheading mb-2 md:mb-4"
            >
              Chào {user.firstName}, bạn đã sẵn sàng cho chuyến đi tiếp theo
              chưa?
            </motion.p>
          )}

          <Typing
            texts={[t("findYourPerfectStay"), t("enjoyYourTrip")]}
            speed={80}
            deleteSpeed={60}
            pause={2000}
            loop={true}
            className={`elegant-heading text-gradient text-2xl sm:text-4xl md:text-6xl lg:text-7xl mb-2 md:mb-4 ${
              lang === "vi"
                ? "min-h-20 sm:min-h-28 md:min-h-50"
                : "min-h-20 sm:min-h-28 md:min-h-55"
            }`}
          />

          <ScrollFade
            delay={500}
            className="elegant-subheading text-xs sm:text-sm md:text-lg text-white/80 mx-auto max-w-2xl text-pretty"
          >
            {t("discoverAccommodations")}
          </ScrollFade>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
        <div className="w-px h-12 bg-linear-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
