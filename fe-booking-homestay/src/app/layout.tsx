import { Toaster as ShadcnToaster } from "@/components/ui/toaster";
import { Toaster as HotToaster } from "react-hot-toast";
import { AuthProvider } from "@/context/auth-context";
import type { Metadata } from "next";
import { Outfit, Fira_Mono, Lora } from "next/font/google";
import "./globals.css";
import PageTransition from "@/styles/animations/PageTransition";

// Sans font
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
});

// Monospace font
const firaMono = Fira_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"], // Fira Mono thường dùng 400
});

// Serif font
const lora = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"], // Lora thường dùng nhiều weight
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
    <html
      lang="en"
      className={`${outfit.variable} ${firaMono.variable} ${lora.variable}`}
    >
      <body className="antialiased">
        <PageTransition>
          <AuthProvider>
            {children}
            <ShadcnToaster />
            <div id="legacy-toaster">
              <HotToaster
                position="top-right"
                toastOptions={{ duration: 10000 }}
              />
            </div>
            <HotToaster
              toastOptions={{ duration: 6000 }}
              position="top-right"
              reverseOrder={false}
            />
          </AuthProvider>
        </PageTransition>
      </body>
    </html>
  );
}
