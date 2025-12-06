import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { GOOGLE_CLIENT_ID } from "@/constants/app.constant";
import { AuthProvider } from "@/context/auth-context";
import PageTransition from "@/styles/animations/PageTransition";
import { GoogleOAuthProvider } from "@react-oauth/google";
import type { Metadata } from "next";
import { Fira_Mono, Lora,Lexend } from "next/font/google";
import { Toaster as HotToaster } from "react-hot-toast";
import "./globals.css";
import { LangProvider } from "@/context/lang-context";

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
          <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID ?? ""}>
            <PageTransition>
              <AuthProvider>{children}</AuthProvider>
            </PageTransition>
          </GoogleOAuthProvider>
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
