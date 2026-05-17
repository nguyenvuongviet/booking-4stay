import { Toaster as ShadcnToaster } from "@/_components/ui/toaster";

import ChatWidget from "@/_components/chatbot/ChatWidget";
import GoogleAuthProviderWrapper from "@/_components/providers/GoogleAuthProviderWrapper";
import { AuthProvider } from "@/context/auth-context";
import { LangProvider } from "@/context/lang-context";
import PageTransition from "@/styles/animations/PageTransition";
import type { Metadata } from "next";
import { Fira_Mono, Lexend, Lora } from "next/font/google";
import { Toaster as HotToaster } from "react-hot-toast";
import "./globals.css";

const lexend = Lexend({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

const firaMono = Fira_Mono({
  subsets: ["latin", "latin-ext"],
  variable: "--font-mono",
  weight: ["400"],
});

const lora = Lora({
  subsets: ["latin", "latin-ext"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
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
    <html lang="vi">
      <body
        className={`${lexend.variable} ${firaMono.variable} ${lora.variable} antialiased`}
      >
        <LangProvider>
          <GoogleAuthProviderWrapper>
            <PageTransition>
              <AuthProvider>
                {children}
                <ChatWidget />
              </AuthProvider>
            </PageTransition>
          </GoogleAuthProviderWrapper>
          <ShadcnToaster />
          <HotToaster
            toastOptions={{ duration: 4000 }}
            position="top-right"
            reverseOrder={false}
          />
        </LangProvider>
      </body>
    </html>
  );
}
