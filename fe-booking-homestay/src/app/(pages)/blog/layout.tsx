import Footer from "@/_components/Footer";
import Header from "@/_components/Header";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | Blog 4Stay",
    default: "Blog Du Lịch | 4Stay",
  },
  description:
    "Khám phá cẩm nang du lịch, kinh nghiệm đặt phòng homestay, review và chia sẻ hữu ích từ cộng đồng 4Stay.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}
