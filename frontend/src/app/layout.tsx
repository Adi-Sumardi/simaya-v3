import type { Metadata, Viewport } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIMAYA - Sistem Informasi Manajemen Aset Yayasan",
  description: "Platform Modern Manajemen Aset Yayasan Terintegrasi dengan Pelacakan QR Code, Mutasi Real-time, dan Pencatatan Kondisi Aset.",
  keywords: ["Manajemen Aset", "SIMAYA", "QR Code Aset", "Pelacakan Aset Yayasan"],
  icons: {
    icon: "/images/yapi.png",
    shortcut: "/images/yapi.png",
    apple: "/images/yapi.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIMAYA",
  },
};

export const viewport: Viewport = {
  themeColor: "#F27A38",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import { ToastProvider } from "@/context/ToastContext";
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/images/yapi.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/yapi.png" />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ToastProvider>
          {children}
        </ToastProvider>
        <Toaster position="top-right" richColors />
        
        {/* Service Worker Registration via next/script */}
        <Script id="pwa-service-worker" strategy="afterInteractive">
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(function(reg) {
                  console.log('SIMAYA Service Worker registered successfully');
                }).catch(function(err) {
                  console.error('SIMAYA Service Worker registration failed:', err);
                });
              });
            }
          `}
        </Script>
      </body>
    </html>
  );
}
