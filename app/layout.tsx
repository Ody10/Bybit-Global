// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import GoogleTranslate from "@/components/GoogleTranslate";
import { TranslationProvider } from "@/app/context/TranslationContext";

export const metadata: Metadata = {
  title: "Bybit App Global - Crypto Trading Platform",
  description: "Trade cryptocurrencies with real-time market data. Your gateway to Bitcoin, Ethereum, and altcoin trading.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body
        className="antialiased bg-[#0a0a0a] font-sans"
        suppressHydrationWarning
      >
        {/* Google Translate - Client-side only, no hydration issues */}
        <GoogleTranslate />
        
        {/* Wrap children with TranslationProvider */}
        <TranslationProvider>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}