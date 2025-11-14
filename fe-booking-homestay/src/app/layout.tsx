import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";
import { AuthProvider } from "@/context/auth-context";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Booking 4Stay",
  description: "Booking 4Stay Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>{children}</AuthProvider>
        <ShadcnToaster />
        <HotToaster
          toastOptions={{ duration: 4000 }}
          position="top-right"
          reverseOrder={false}
        />
      </body>
    </html>
  );
}
